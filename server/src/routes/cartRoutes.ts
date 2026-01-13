
import express from 'express';
import {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    validateCart,
} from '../controllers/cartController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

/**
 * Cart Routes
 * 
 * All cart routes require authentication.
 * Cart is stored server-side for logged-in users.
 * 
 * Note: For guest users, cart can be handled client-side (localStorage)
 * and merged upon login (future enhancement).
 */

// Apply protection to all routes
router.use(protect);

// ============================================
// Cart Operations
// ============================================

/**
 * GET /api/v1/cart
 * Get current user's cart with all items and totals.
 */
router.get('/', getCart);

/**
 * DELETE /api/v1/cart
 * Clear all items from cart.
 */
router.delete('/', clearCart);

/**
 * POST /api/v1/cart/items
 * Add item to cart.
 * Body: { productId: string, quantity?: number }
 */
router.post('/items', addToCart);

/**
 * PUT /api/v1/cart/items/:productId
 * Update quantity of specific item in cart.
 * Body: { quantity: number }
 * Note: Setting quantity to 0 removes the item.
 */
router.put('/items/:productId', updateCartItem);

/**
 * DELETE /api/v1/cart/items/:productId
 * Remove specific item from cart.
 */
router.delete('/items/:productId', removeFromCart);

/**
 * POST /api/v1/cart/validate
 * Validate cart before checkout.
 * Checks: product availability, stock, price changes.
 * Updates cart if necessary and returns validation report.
 */
router.post('/validate', validateCart);

export default router;
