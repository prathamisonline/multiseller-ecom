
import express from 'express';
import { generateShippingLabel } from '../controllers/shippingController';
import { protect, authorize } from '../middlewares/authMiddleware';

const router = express.Router();

/**
 * Shipping Routes
 * 
 * Provides features for order fulfillment.
 */

// Apply protection - only sellers and admins can generate labels
router.use(protect);
router.use(authorize('seller', 'admin'));

/**
 * GET /api/v1/shipping/label/:orderId
 * Generate a printable 4x6 shipping label for an order.
 * 
 * Response: PDF File
 */
router.get('/label/:orderId', generateShippingLabel);

export default router;
