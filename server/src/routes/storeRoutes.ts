
import express from 'express';
import {
    getPublicProducts,
    getPublicProductByIdOrSlug,
    getCategories,
    getProductsBySeller,
} from '../controllers/storeController';

const router = express.Router();

/**
 * Public Store Routes
 * 
 * These routes are PUBLIC (no authentication required).
 * They are used by the customer-facing storefront.
 */

// ============================================
// Product Browsing
// ============================================

/**
 * GET /api/v1/store/products
 * 
 * Query Parameters:
 *   - category: Filter by category (e.g., ?category=Electronics)
 *   - minPrice: Filter by minimum price (e.g., ?minPrice=100)
 *   - maxPrice: Filter by maximum price (e.g., ?maxPrice=500)
 *   - search: Search by product name (e.g., ?search=phone)
 *   - sort: Sort results (e.g., ?sort=-price for descending price)
 *   - page: Page number (e.g., ?page=2)
 *   - limit: Results per page (e.g., ?limit=20, max 50)
 */
router.get('/products', getPublicProducts);

/**
 * GET /api/v1/store/products/:identifier
 * 
 * Fetch a single product by ID or slug.
 * Supports SEO-friendly URLs using slugs.
 */
router.get('/products/:identifier', getPublicProductByIdOrSlug);

// ============================================
// Categories
// ============================================

/**
 * GET /api/v1/store/categories
 * 
 * Get list of unique categories for filter UI.
 */
router.get('/categories', getCategories);

// ============================================
// Seller Store Pages
// ============================================

/**
 * GET /api/v1/store/sellers/:sellerId/products
 * 
 * Get all products from a specific seller.
 * Useful for seller store pages.
 */
router.get('/sellers/:sellerId/products', getProductsBySeller);

export default router;
