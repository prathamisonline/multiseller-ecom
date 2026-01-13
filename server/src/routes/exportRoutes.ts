
import express from 'express';
import {
    exportOrdersAdmin,
    exportOrdersSeller,
    exportProductsAdmin,
    exportProductsSeller
} from '../controllers/exportController';
import { protect, authorize } from '../middlewares/authMiddleware';

const router = express.Router();

/**
 * Excel Export Routes
 * 
 * Provides endpoints to download data in .xlsx format.
 * High-performance exports using ExcelJS.
 */

// All export routes are protected
router.use(protect);

// ============================================
// Admin Exports
// ============================================
router.get('/admin/orders', authorize('admin'), exportOrdersAdmin);
router.get('/admin/products', authorize('admin'), exportProductsAdmin);

// ============================================
// Seller Exports
// ============================================
router.get('/seller/orders', authorize('seller', 'admin'), exportOrdersSeller);
router.get('/seller/products', authorize('seller', 'admin'), exportProductsSeller);

export default router;
