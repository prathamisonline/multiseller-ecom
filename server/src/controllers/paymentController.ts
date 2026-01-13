
import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import Order from '../models/orderModel';
import razorpay from '../config/razorpay';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import { ApiResponse } from '../utils/ApiResponse';

/**
 * @desc    Create Razorpay order for payment
 * @route   POST /api/v1/payments/create-order
 * @body    { orderId: string } - MongoDB Order ID
 * @access  Private/Public (depends on order type)
 * 
 * This endpoint creates a Razorpay order linked to our internal order.
 * The Razorpay order ID is used by the frontend to initiate payment.
 * 
 * Flow:
 * 1. User creates order (status: 'created')
 * 2. User calls this endpoint to get Razorpay order
 * 3. Frontend uses Razorpay SDK to open payment modal
 * 4. After payment, frontend calls verify endpoint
 */
export const createRazorpayOrder = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { orderId } = req.body;

    if (!orderId) {
        return next(new AppError('Order ID is required', 400));
    }

    // 1. Find the order
    const order = await Order.findById(orderId);

    if (!order) {
        return next(new AppError('Order not found', 404));
    }

    // 2. Validate order status
    if (order.status !== 'created') {
        return next(new AppError(`Cannot initiate payment for order with status "${order.status}"`, 400));
    }

    // 3. Check if Razorpay order already exists
    if (order.paymentInfo.razorpayOrderId) {
        // Return existing Razorpay order
        return res.status(200).json(
            new ApiResponse(200, {
                razorpayOrderId: order.paymentInfo.razorpayOrderId,
                amount: order.totalAmount * 100, // Amount in paise
                currency: 'INR',
                orderId: order._id,
                orderNumber: order.orderNumber,
            }, 'Razorpay order already exists')
        );
    }

    // 4. Create Razorpay order
    // Amount must be in smallest currency unit (paise for INR)
    const razorpayOrderOptions = {
        amount: Math.round(order.totalAmount * 100), // Convert to paise
        currency: 'INR',
        receipt: order.orderNumber, // Our order number as receipt
        notes: {
            orderId: order._id.toString(),
            orderNumber: order.orderNumber,
        },
    };

    try {
        const razorpayOrder = await razorpay.orders.create(razorpayOrderOptions);

        // 5. Save Razorpay order ID to our order
        order.paymentInfo.razorpayOrderId = razorpayOrder.id;
        await order.save();

        // 6. Return data needed for frontend
        res.status(200).json(
            new ApiResponse(200, {
                razorpayOrderId: razorpayOrder.id,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                orderId: order._id,
                orderNumber: order.orderNumber,
                // Include key for frontend (public key is safe to expose)
                razorpayKeyId: process.env.RAZORPAY_KEY_ID,
            }, 'Razorpay order created successfully')
        );
    } catch (error: any) {
        console.error('Razorpay order creation error:', error);
        return next(new AppError('Failed to create payment order. Please try again.', 500));
    }
});

/**
 * @desc    Verify Razorpay payment signature
 * @route   POST /api/v1/payments/verify
 * @body    {
 *            razorpay_order_id: string,
 *            razorpay_payment_id: string,
 *            razorpay_signature: string,
 *            orderId: string
 *          }
 * @access  Private/Public
 * 
 * This endpoint verifies the payment signature to ensure the payment
 * was not tampered with. Must be called after successful payment.
 * 
 * Security:
 * - Razorpay generates a signature using HMAC SHA256
 * - We verify this signature using our secret key
 * - If signature matches, payment is authentic
 */
export const verifyPayment = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        orderId,
    } = req.body;

    // 1. Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
        return next(new AppError('Missing payment verification data', 400));
    }

    // 2. Find the order
    const order = await Order.findById(orderId);

    if (!order) {
        return next(new AppError('Order not found', 404));
    }

    // 3. Verify the Razorpay order ID matches
    if (order.paymentInfo.razorpayOrderId !== razorpay_order_id) {
        return next(new AppError('Order ID mismatch', 400));
    }

    // 4. Generate signature for verification
    // Signature = HMAC_SHA256(razorpay_order_id + "|" + razorpay_payment_id, secret)
    const generatedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET as string)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

    // 5. Compare signatures
    const isSignatureValid = generatedSignature === razorpay_signature;

    if (!isSignatureValid) {
        // Payment verification failed - possible tampering
        order.paymentInfo.status = 'failed';
        order.statusHistory.push({
            status: order.status,
            timestamp: new Date(),
            note: 'Payment verification failed - invalid signature',
        });
        await order.save();

        return next(new AppError('Payment verification failed', 400));
    }

    // 6. Payment verified successfully - update order
    order.paymentInfo.razorpayPaymentId = razorpay_payment_id;
    order.paymentInfo.razorpaySignature = razorpay_signature;
    order.paymentInfo.status = 'paid';
    order.paymentInfo.paidAt = new Date();
    order.status = 'paid';
    order.statusHistory.push({
        status: 'paid',
        timestamp: new Date(),
        note: 'Payment received successfully',
    });

    await order.save();

    res.status(200).json(
        new ApiResponse(200, {
            order,
            paymentId: razorpay_payment_id,
        }, 'Payment verified successfully')
    );
});

/**
 * @desc    Razorpay Webhook Handler
 * @route   POST /api/v1/payments/webhook
 * @access  Public (Razorpay servers)
 * 
 * This endpoint receives payment events from Razorpay.
 * Important for handling:
 * - Delayed payment confirmations
 * - Failed payments
 * - Refunds
 * 
 * Security:
 * - Verify webhook signature to ensure request is from Razorpay
 * - Use raw body for signature verification
 */
export const handleWebhook = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // 1. Get webhook signature from headers
    const webhookSignature = req.headers['x-razorpay-signature'] as string;
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // If webhook secret is configured, verify signature
    if (webhookSecret && webhookSignature) {
        const generatedSignature = crypto
            .createHmac('sha256', webhookSecret)
            .update(JSON.stringify(req.body))
            .digest('hex');

        if (generatedSignature !== webhookSignature) {
            console.error('Webhook signature verification failed');
            return res.status(400).json({ error: 'Invalid signature' });
        }
    }

    // 2. Parse the event
    const event = req.body;
    const eventType = event.event;

    console.log('Razorpay Webhook Event:', eventType);

    // 3. Handle different event types
    switch (eventType) {
        case 'payment.captured': {
            // Payment was successfully captured
            const payment = event.payload.payment.entity;
            const razorpayOrderId = payment.order_id;

            const order = await Order.findOne({
                'paymentInfo.razorpayOrderId': razorpayOrderId,
            });

            if (order && order.paymentInfo.status !== 'paid') {
                order.paymentInfo.razorpayPaymentId = payment.id;
                order.paymentInfo.status = 'paid';
                order.paymentInfo.method = payment.method;
                order.paymentInfo.paidAt = new Date();
                order.status = 'paid';
                order.statusHistory.push({
                    status: 'paid',
                    timestamp: new Date(),
                    note: 'Payment captured via webhook',
                });
                await order.save();
                console.log(`Order ${order.orderNumber} marked as paid via webhook`);
            }
            break;
        }

        case 'payment.failed': {
            // Payment failed
            const payment = event.payload.payment.entity;
            const razorpayOrderId = payment.order_id;

            const order = await Order.findOne({
                'paymentInfo.razorpayOrderId': razorpayOrderId,
            });

            if (order) {
                order.paymentInfo.status = 'failed';
                order.statusHistory.push({
                    status: order.status,
                    timestamp: new Date(),
                    note: `Payment failed: ${payment.error_description || 'Unknown error'}`,
                });
                await order.save();
                console.log(`Order ${order.orderNumber} payment failed via webhook`);
            }
            break;
        }

        case 'refund.created': {
            // Refund was initiated
            const refund = event.payload.refund.entity;
            const paymentId = refund.payment_id;

            const order = await Order.findOne({
                'paymentInfo.razorpayPaymentId': paymentId,
            });

            if (order) {
                order.paymentInfo.status = 'refunded';
                order.status = 'refunded';
                order.statusHistory.push({
                    status: 'refunded',
                    timestamp: new Date(),
                    note: `Refund processed: ${refund.id}`,
                });
                await order.save();
                console.log(`Order ${order.orderNumber} refunded via webhook`);
            }
            break;
        }

        default:
            console.log('Unhandled webhook event:', eventType);
    }

    // 4. Always respond with 200 to acknowledge receipt
    res.status(200).json({ received: true });
});

/**
 * @desc    Get payment status for an order
 * @route   GET /api/v1/payments/status/:orderId
 * @access  Private/Public
 */
export const getPaymentStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
        return next(new AppError('Order not found', 404));
    }

    res.status(200).json(
        new ApiResponse(200, {
            orderNumber: order.orderNumber,
            paymentStatus: order.paymentInfo.status,
            orderStatus: order.status,
            paidAt: order.paymentInfo.paidAt,
        }, 'Payment status fetched')
    );
});

/**
 * @desc    Retry payment for a failed order
 * @route   POST /api/v1/payments/retry/:orderId
 * @access  Private
 * 
 * Creates a new Razorpay order for a previously failed payment attempt.
 */
export const retryPayment = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
        return next(new AppError('Order not found', 404));
    }

    // Only allow retry for failed or pending payments on 'created' orders
    if (order.status !== 'created' || order.paymentInfo.status === 'paid') {
        return next(new AppError('Cannot retry payment for this order', 400));
    }

    // Create new Razorpay order
    const razorpayOrderOptions = {
        amount: Math.round(order.totalAmount * 100),
        currency: 'INR',
        receipt: `${order.orderNumber}-retry-${Date.now()}`,
        notes: {
            orderId: order._id.toString(),
            orderNumber: order.orderNumber,
            retry: 'true',
        },
    };

    try {
        const razorpayOrder = await razorpay.orders.create(razorpayOrderOptions);

        // Update order with new Razorpay order ID
        order.paymentInfo.razorpayOrderId = razorpayOrder.id;
        order.paymentInfo.status = 'pending';
        await order.save();

        res.status(200).json(
            new ApiResponse(200, {
                razorpayOrderId: razorpayOrder.id,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                orderId: order._id,
                orderNumber: order.orderNumber,
                razorpayKeyId: process.env.RAZORPAY_KEY_ID,
            }, 'New payment order created for retry')
        );
    } catch (error: any) {
        console.error('Razorpay retry order creation error:', error);
        return next(new AppError('Failed to create payment order. Please try again.', 500));
    }
});
