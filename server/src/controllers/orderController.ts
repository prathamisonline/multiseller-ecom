
import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Order from '../models/orderModel';
import Cart from '../models/cartModel';
import Product from '../models/productModel';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import { ApiResponse } from '../utils/ApiResponse';

/**
 * @desc    Create a new order from cart
 * @route   POST /api/v1/orders
 * @body    {
 *            shippingAddress: { fullName, phone, addressLine1, city, state, postalCode, country },
 *            notes?: string
 *          }
 * @access  Private
 * 
 * This is the main checkout endpoint. It:
 * 1. Validates the cart
 * 2. Checks stock availability
 * 3. Creates the order
 * 4. Deducts stock from products (atomic operation)
 * 5. Clears the cart
 * 
 * Payment is handled separately after order creation.
 */
export const createOrder = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { shippingAddress, notes } = req.body;

    // 1. Validate shipping address
    if (!shippingAddress) {
        return next(new AppError('Shipping address is required', 400));
    }

    const requiredAddressFields = ['fullName', 'phone', 'addressLine1', 'city', 'state', 'postalCode'];
    for (const field of requiredAddressFields) {
        if (!shippingAddress[field]) {
            return next(new AppError(`${field} is required in shipping address`, 400));
        }
    }

    // 2. Get user's cart
    const cart = await Cart.findOne({ user: req.user!._id });

    if (!cart || cart.items.length === 0) {
        return next(new AppError('Cart is empty. Add items before checkout.', 400));
    }

    // 3. Validate and prepare order items with stock check
    // Using a session for atomic operations (stock deduction)
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const orderItems = [];
        let itemsTotal = 0;

        for (const cartItem of cart.items) {
            // Find product and lock it for update
            const product = await Product.findById(cartItem.product).session(session);

            if (!product || product.status !== 'approved' || product.archived) {
                await session.abortTransaction();
                return next(new AppError(`Product "${cartItem.name}" is no longer available`, 400));
            }

            if (product.stock < cartItem.quantity) {
                await session.abortTransaction();
                return next(
                    new AppError(
                        `Insufficient stock for "${cartItem.name}". Available: ${product.stock}`,
                        400
                    )
                );
            }

            // Deduct stock
            product.stock -= cartItem.quantity;
            await product.save({ session });

            // Prepare order item
            const itemTotal = product.price * cartItem.quantity;
            orderItems.push({
                product: product._id,
                seller: product.seller,
                name: product.name,
                price: product.price, // Use current price
                image: product.images[0] || '',
                quantity: cartItem.quantity,
                itemTotal,
            });

            itemsTotal += itemTotal;
        }

        // 4. Calculate totals
        const shippingCost = 0; // Can be calculated based on business logic
        const taxAmount = 0; // Can be calculated based on business logic (e.g., 18% GST)
        const totalAmount = itemsTotal + shippingCost + taxAmount;

        // 5. Create order
        const orderNumber = Order.generateOrderNumber();

        const order = new Order({
            orderNumber,
            user: req.user!._id,
            items: orderItems,
            shippingAddress: {
                ...shippingAddress,
                country: shippingAddress.country || 'India',
            },
            itemsTotal,
            shippingCost,
            taxAmount,
            totalAmount,
            notes,
            status: 'created',
            paymentInfo: {
                status: 'pending',
            },
        });

        await order.save({ session });

        // 6. Clear the cart
        cart.items = [];
        await cart.save({ session });

        // 7. Commit transaction
        await session.commitTransaction();

        res.status(201).json(
            new ApiResponse(201, order, 'Order created successfully. Proceed to payment.')
        );
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
});

/**
 * @desc    Create order for guest users
 * @route   POST /api/v1/orders/guest
 * @body    {
 *            items: [{ productId, quantity }],
 *            shippingAddress: {...},
 *            guestInfo: { email, phone, name },
 *            notes?: string
 *          }
 * @access  Public
 * 
 * Allows users to checkout without creating an account.
 */
export const createGuestOrder = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { items, shippingAddress, guestInfo, notes } = req.body;

    // 1. Validate guest info
    if (!guestInfo || !guestInfo.email || !guestInfo.phone || !guestInfo.name) {
        return next(new AppError('Guest information (email, phone, name) is required', 400));
    }

    // 2. Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
        return next(new AppError('Order must contain at least one item', 400));
    }

    // 3. Validate shipping address
    if (!shippingAddress) {
        return next(new AppError('Shipping address is required', 400));
    }

    // 4. Process order with transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const orderItems = [];
        let itemsTotal = 0;

        for (const item of items) {
            if (!item.productId || !item.quantity || item.quantity < 1) {
                await session.abortTransaction();
                return next(new AppError('Invalid item: productId and quantity are required', 400));
            }

            const product = await Product.findById(item.productId).session(session);

            if (!product || product.status !== 'approved' || product.archived) {
                await session.abortTransaction();
                return next(new AppError(`Product not available`, 404));
            }

            if (product.stock < item.quantity) {
                await session.abortTransaction();
                return next(
                    new AppError(`Insufficient stock for "${product.name}". Available: ${product.stock}`, 400)
                );
            }

            // Deduct stock
            product.stock -= item.quantity;
            await product.save({ session });

            // Prepare order item
            const itemTotal = product.price * item.quantity;
            orderItems.push({
                product: product._id,
                seller: product.seller,
                name: product.name,
                price: product.price,
                image: product.images[0] || '',
                quantity: item.quantity,
                itemTotal,
            });

            itemsTotal += itemTotal;
        }

        // 5. Calculate totals
        const shippingCost = 0;
        const taxAmount = 0;
        const totalAmount = itemsTotal + shippingCost + taxAmount;

        // 6. Create order
        const orderNumber = Order.generateOrderNumber();

        const order = new Order({
            orderNumber,
            // No user - guest order
            guestInfo,
            items: orderItems,
            shippingAddress: {
                ...shippingAddress,
                country: shippingAddress.country || 'India',
            },
            itemsTotal,
            shippingCost,
            taxAmount,
            totalAmount,
            notes,
            status: 'created',
            paymentInfo: {
                status: 'pending',
            },
        });

        await order.save({ session });
        await session.commitTransaction();

        res.status(201).json(
            new ApiResponse(201, order, 'Order created successfully. Proceed to payment.')
        );
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
});

/**
 * @desc    Get logged-in user's orders
 * @route   GET /api/v1/orders/my-orders
 * @query   status - Filter by status
 * @query   page, limit - Pagination
 * @access  Private
 */
export const getMyOrders = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const queryObj: Record<string, any> = { user: req.user!._id };

    if (req.query.status) {
        queryObj.status = req.query.status;
    }

    const page = parseInt(req.query.page as string, 10) || 1;
    let limit = parseInt(req.query.limit as string, 10) || 10;
    if (limit > 50) limit = 50;
    const skip = (page - 1) * limit;

    const total = await Order.countDocuments(queryObj);
    const orders = await Order.find(queryObj)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    res.status(200).json(
        new ApiResponse(200, {
            orders,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        }, 'Orders fetched successfully')
    );
});

/**
 * @desc    Get single order by ID
 * @route   GET /api/v1/orders/:id
 * @access  Private (Owner only)
 */
export const getOrderById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        return next(new AppError('Order not found', 404));
    }

    // Ownership check (skip for admins)
    if (order.user && order.user.toString() !== req.user!._id.toString() && req.user!.role !== 'admin') {
        return next(new AppError('Not authorized to view this order', 403));
    }

    res.status(200).json(
        new ApiResponse(200, order, 'Order fetched successfully')
    );
});

/**
 * @desc    Get order by order number (for guest tracking)
 * @route   GET /api/v1/orders/track/:orderNumber
 * @query   email - Guest email for verification
 * @access  Public
 */
export const trackOrder = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { orderNumber } = req.params;
    const { email } = req.query;

    const order = await Order.findOne({ orderNumber });

    if (!order) {
        return next(new AppError('Order not found', 404));
    }

    // For guest orders, verify email
    if (!order.user && order.guestInfo) {
        if (!email || order.guestInfo.email !== email) {
            return next(new AppError('Invalid email for this order', 403));
        }
    }

    // Return limited info for tracking
    res.status(200).json(
        new ApiResponse(200, {
            orderNumber: order.orderNumber,
            status: order.status,
            statusHistory: order.statusHistory,
            items: order.items.map((item) => ({
                name: item.name,
                quantity: item.quantity,
                image: item.image,
            })),
            totalAmount: order.totalAmount,
            createdAt: order.createdAt,
        }, 'Order tracking info fetched')
    );
});

/**
 * @desc    Cancel an order (before shipping)
 * @route   PUT /api/v1/orders/:id/cancel
 * @access  Private (Owner only)
 * 
 * Only orders with status 'created' or 'paid' can be cancelled.
 * Stock is restored on cancellation.
 */
export const cancelOrder = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        return next(new AppError('Order not found', 404));
    }

    // Ownership check
    if (order.user && order.user.toString() !== req.user!._id.toString()) {
        return next(new AppError('Not authorized to cancel this order', 403));
    }

    // Check if order can be cancelled
    const cancellableStatuses = ['created', 'paid', 'processing'];
    if (!cancellableStatuses.includes(order.status)) {
        return next(new AppError(`Cannot cancel order with status "${order.status}"`, 400));
    }

    // Restore stock
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        for (const item of order.items) {
            await Product.findByIdAndUpdate(
                item.product,
                { $inc: { stock: item.quantity } },
                { session }
            );
        }

        // Update order status
        order.status = 'cancelled';
        order.statusHistory.push({
            status: 'cancelled',
            timestamp: new Date(),
            note: 'Cancelled by customer',
        });

        await order.save({ session });
        await session.commitTransaction();

        res.status(200).json(
            new ApiResponse(200, order, 'Order cancelled successfully. Stock has been restored.')
        );
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
});
