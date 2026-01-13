
import express from 'express';
import {
    createProduct,
    getMyProducts,
    getProductById,
    updateProduct,
    deleteProduct,
} from '../controllers/productController';
import { protect, authorize } from '../middlewares/authMiddleware';

const router = express.Router();

/**
 * Product Routes for Sellers
 * 
 * All routes are protected and require 'seller' role.
 * Note: 'seller' role is assigned after admin approval of seller application.
 */

// Apply protection to all routes
router.use(protect);

// Routes accessible by sellers (and admins implicitly if needed)
router.use(authorize('seller', 'admin'));

router
    .route('/')
    .post(createProduct); // POST /api/v1/products - Create new product

router.get('/my-products', getMyProducts); // GET /api/v1/products/my-products - List seller's products

router
    .route('/:id')
    .get(getProductById)    // GET /api/v1/products/:id - Get single product
    .put(updateProduct)     // PUT /api/v1/products/:id - Update product
    .delete(deleteProduct); // DELETE /api/v1/products/:id - Soft delete product

export default router;
