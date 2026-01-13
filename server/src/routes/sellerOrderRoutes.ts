
import express from 'express';
import {
    getSellerOrders,
    getSellerOrderById,
    updateOrderStatusSeller,
} from '../controllers/orderManagementController';
import { protect, authorize } from '../middlewares/authMiddleware';

const router = express.Router();

/**
 * Seller Order Management Routes
 * 
 * These routes allow sellers to view and manage orders
 * containing their products.
 * 
 * Key Features:
 * - View only items belonging to the seller (multi-vendor privacy)
 * - Update order status (processing, shipped)
 * - See seller's portion of order total
 */

// Apply protection and seller authorization
router.use(protect);
router.use(authorize('seller', 'admin'));

// ============================================
// Order Listing
// ============================================

/**
 * GET /api/v1/seller-orders
 * Get all orders containing seller's products.
 * 
 * Query params:
 * - status: Filter by order status (e.g., ?status=paid)
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 10, max: 50)
 */
router.get('/', getSellerOrders);

/**
 * GET /api/v1/seller-orders/:id
 * Get single order details (seller's items only).
 */
router.get('/:id', getSellerOrderById);

// ============================================
// Order Status Updates
// ============================================

/**
 * PUT /api/v1/seller-orders/:id/status
 * Update order status.
 * 
 * Body: { status: 'processing' | 'shipped', note?: string }
 * 
 * Status Flow for Sellers:
 * paid -> processing -> shipped
 * 
 * Note: 'delivered' is typically confirmed by admin or delivery system.
 */
router.put('/:id/status', updateOrderStatusSeller);

export default router;
