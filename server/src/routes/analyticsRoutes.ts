
import express from 'express';
import {
    getAdminOverview,
    getRevenueAnalytics,
    getOrderStatusDistribution,
    getTopSellingProducts,
    getTopSellers,
    getSellerOverview,
    getSellerRevenueAnalytics,
    getSellerTopProducts,
} from '../controllers/analyticsController';
import { protect, authorize } from '../middlewares/authMiddleware';

const router = express.Router();

/**
 * Analytics Routes
 * 
 * Provides data for dashboards and reports.
 * 
 * Structure:
 * - /admin/*   - Platform-wide analytics (Admin only)
 * - /seller/*  - Seller-specific analytics (Seller only)
 */

// Apply protection
router.use(protect);

// ============================================
// ADMIN ANALYTICS
// ============================================

/**
 * GET /api/v1/analytics/admin/overview
 * 
 * Dashboard header cards showing:
 * - Total/Today's revenue
 * - Total/Today's/Pending orders
 * - User counts
 * - Seller counts (approved/pending)
 * - Product counts (approved/pending)
 */
router.get('/admin/overview', authorize('admin'), getAdminOverview);

/**
 * GET /api/v1/analytics/admin/revenue
 * 
 * Revenue data for line/bar charts.
 * Query params:
 * - period: 'daily' | 'weekly' | 'monthly' (default: 'daily')
 * - days: Number of days to look back (default: 30)
 * 
 * Response: [{ date, revenue, orders }, ...]
 */
router.get('/admin/revenue', authorize('admin'), getRevenueAnalytics);

/**
 * GET /api/v1/analytics/admin/orders/status
 * 
 * Order status distribution for pie/donut charts.
 * Response: { created: 5, paid: 10, processing: 3, ... }
 */
router.get('/admin/orders/status', authorize('admin'), getOrderStatusDistribution);

/**
 * GET /api/v1/analytics/admin/products/top
 * 
 * Top selling products by quantity sold.
 * Query: limit (default: 10)
 * 
 * Response: [{ productName, totalQuantity, totalRevenue }, ...]
 */
router.get('/admin/products/top', authorize('admin'), getTopSellingProducts);

/**
 * GET /api/v1/analytics/admin/sellers/top
 * 
 * Top sellers by revenue.
 * Query: limit (default: 10)
 * 
 * Response: [{ storeName, sellerName, totalRevenue, totalOrders }, ...]
 */
router.get('/admin/sellers/top', authorize('admin'), getTopSellers);

// ============================================
// SELLER ANALYTICS
// ============================================

/**
 * GET /api/v1/analytics/seller/overview
 * 
 * Seller dashboard header cards showing:
 * - Total/Today's revenue (from seller's products)
 * - Total/Today's/Pending orders
 * - Product counts (total/approved/pending)
 */
router.get('/seller/overview', authorize('seller', 'admin'), getSellerOverview);

/**
 * GET /api/v1/analytics/seller/revenue
 * 
 * Seller's revenue data for charts.
 * Query: days (default: 30)
 * 
 * Response: [{ date, revenue, quantity }, ...]
 */
router.get('/seller/revenue', authorize('seller', 'admin'), getSellerRevenueAnalytics);

/**
 * GET /api/v1/analytics/seller/products/top
 * 
 * Seller's top products by sales.
 * Query: limit (default: 10)
 */
router.get('/seller/products/top', authorize('seller', 'admin'), getSellerTopProducts);

export default router;
