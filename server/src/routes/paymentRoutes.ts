
import express from 'express';
import {
    createRazorpayOrder,
    verifyPayment,
    handleWebhook,
    getPaymentStatus,
    retryPayment,
} from '../controllers/paymentController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

/**
 * Payment Routes
 * 
 * Handles Razorpay payment integration.
 * 
 * Payment Flow:
 * 1. User creates order (POST /orders)
 * 2. User calls POST /payments/create-order with orderId
 * 3. Frontend receives razorpayOrderId and opens Razorpay checkout
 * 4. After payment, frontend calls POST /payments/verify
 * 5. If verification passes, order status becomes 'paid'
 */

// ============================================
// WEBHOOK (Must be before any body parsers in production)
// ============================================

/**
 * POST /api/v1/payments/webhook
 * Razorpay webhook endpoint.
 * Receives events like payment.captured, payment.failed, refund.created
 * 
 * Note: In production, configure webhook URL in Razorpay Dashboard:
 * Settings -> Webhooks -> Add New Webhook
 * URL: https://yourdomain.com/api/v1/payments/webhook
 */
router.post('/webhook', handleWebhook);

// ============================================
// PUBLIC ROUTES
// ============================================

/**
 * POST /api/v1/payments/create-order
 * Create Razorpay order for payment.
 * Can be called for both user and guest orders.
 * Body: { orderId }
 */
router.post('/create-order', createRazorpayOrder);

/**
 * POST /api/v1/payments/verify
 * Verify payment after Razorpay checkout completes.
 * Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId }
 */
router.post('/verify', verifyPayment);

/**
 * GET /api/v1/payments/status/:orderId
 * Get payment status for an order.
 */
router.get('/status/:orderId', getPaymentStatus);

// ============================================
// PROTECTED ROUTES
// ============================================

router.use(protect);

/**
 * POST /api/v1/payments/retry/:orderId
 * Retry payment for a failed/pending order.
 */
router.post('/retry/:orderId', retryPayment);

export default router;
