
import express from 'express';
import {
    createOrder,
    createGuestOrder,
    getMyOrders,
    getOrderById,
    trackOrder,
    cancelOrder,
} from '../controllers/orderController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

/**
 * Order Routes
 * 
 * Handles order creation, tracking, and management.
 * Supports both authenticated users and guest checkout.
 */

// ============================================
// PUBLIC ROUTES (No authentication required)
// ============================================

/**
 * POST /api/v1/orders/guest
 * Create order without an account (guest checkout).
 * Body: {
 *   items: [{ productId, quantity }],
 *   shippingAddress: { fullName, phone, addressLine1, city, state, postalCode },
 *   guestInfo: { email, phone, name }
 * }
 */
router.post('/guest', createGuestOrder);

/**
 * GET /api/v1/orders/track/:orderNumber
 * Track order status by order number.
 * Query: email (required for guest orders)
 */
router.get('/track/:orderNumber', trackOrder);

// ============================================
// PROTECTED ROUTES (Authentication required)
// ============================================

router.use(protect);

/**
 * POST /api/v1/orders
 * Create order from cart (logged-in users).
 * Body: {
 *   shippingAddress: { fullName, phone, addressLine1, city, state, postalCode },
 *   notes?: string
 * }
 */
router.post('/', createOrder);
router.post('/checkout', createOrder); // Alias for Postman collection

/**
 * GET /api/v1/orders/my-orders
 * Get logged-in user's order history.
 * Query: status, page, limit
 */
router.get('/my-orders', getMyOrders);

/**
 * GET /api/v1/orders/:id
 * Get single order details (owner only).
 */
router.get('/:id', getOrderById);

/**
 * PUT /api/v1/orders/:id/cancel
 * Cancel an order (before shipping).
 * Restores product stock.
 */
router.put('/:id/cancel', cancelOrder);

export default router;
