
import express from 'express';
import {
    getAllSellers,
    getSellerById,
    approveSeller,
    rejectSeller,
    suspendSeller,
    reactivateSeller,
    getAllProducts,
    getProductByIdAdmin,
    approveProduct,
    rejectProduct,
    getAllUsers,
    getUserByIdAdmin,
    updateUserStatus,
    deleteUser,
} from '../controllers/adminController';
import {
    getAllOrdersAdmin,
    getOrderByIdAdmin,
    updateOrderStatusAdmin,
    getOrderStats,
} from '../controllers/orderManagementController';
import { protect, authorize } from '../middlewares/authMiddleware';

const router = express.Router();

/**
 * All routes below are protected and require 'admin' role.
 * 
 * protect: Validates JWT and attaches user to request.
 * authorize('admin'): Checks if user.role === 'admin'.
 */
router.use(protect);
router.use(authorize('admin'));

// ============================================
// Seller Management Routes
// ============================================
router.get('/sellers', getAllSellers);           // List all sellers (with optional ?status=pending filter)
router.get('/sellers/:id', getSellerById);       // Get single seller details
router.put('/sellers/:id/approve', approveSeller);   // Approve a pending seller
router.put('/sellers/:id/reject', rejectSeller);     // Reject a pending seller
router.put('/sellers/:id/suspend', suspendSeller);   // Suspend an approved seller
router.put('/sellers/:id/reactivate', reactivateSeller); // Reactivate a suspended seller

// ============================================
// Product Management Routes
// ============================================
router.get('/products', getAllProducts);             // List all products (with optional ?status=pending filter)
router.get('/products/:id', getProductByIdAdmin);    // Get single product details
router.put('/products/:id/approve', approveProduct); // Approve a pending product
router.put('/products/:id/reject', rejectProduct);   // Reject a pending product

// ============================================
// Order Management Routes
// ============================================
router.get('/orders', getAllOrdersAdmin);            // List all orders (with filters)
router.get('/orders/stats', getOrderStats);          // Get order statistics for dashboard
router.get('/orders/:id', getOrderByIdAdmin);        // Get single order details
router.put('/orders/:id/status', updateOrderStatusAdmin); // Update order status

// ============================================
// User Management Routes
// ============================================
router.get('/users', getAllUsers);
router.get('/users/:id', getUserByIdAdmin);
router.put('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);

// ============================================
// Finance Routes
// ============================================
import { getFinanceStats, getPayouts } from '../controllers/financeController';

router.get('/finance/stats', getFinanceStats);
router.get('/finance/payouts', getPayouts);

export default router;
