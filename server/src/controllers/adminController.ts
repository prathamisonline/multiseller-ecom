
import { Request, Response, NextFunction } from 'express';
import Seller from '../models/sellerModel';
import User from '../models/userModel';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import { ApiResponse } from '../utils/ApiResponse';

/**
 * @desc    Get all sellers (with optional status filter)
 * @route   GET /api/v1/admin/sellers
 * @query   status - Filter by status (pending, approved, rejected, suspended)
 * @access  Private/Admin
 * 
 * This endpoint allows admins to view all seller applications.
 * Pagination can be added later for production scalability.
 */
export const getAllSellers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // Build query object based on optional status filter
    const queryObj: { status?: string } = {};

    if (req.query.status) {
        // Validate that the status is one of the allowed values
        const allowedStatuses = ['pending', 'approved', 'rejected', 'suspended'];
        if (!allowedStatuses.includes(req.query.status as string)) {
            return next(new AppError(`Invalid status. Allowed: ${allowedStatuses.join(', ')}`, 400));
        }
        queryObj.status = req.query.status as string;
    }

    // Fetch sellers, populate user info (name, email) for admin context
    const sellers = await Seller.find(queryObj)
        .populate({
            path: 'user',
            select: 'name email', // Only fetch necessary user fields
        })
        .sort({ createdAt: -1 }); // Newest applications first

    res.status(200).json(
        new ApiResponse(200, { count: sellers.length, sellers }, 'Sellers fetched successfully')
    );
});

/**
 * @desc    Get a single seller by ID
 * @route   GET /api/v1/admin/sellers/:id
 * @access  Private/Admin
 * 
 * Useful for viewing detailed seller information before approval/rejection.
 */
export const getSellerById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const seller = await Seller.findById(req.params.id).populate({
        path: 'user',
        select: 'name email createdAt',
    });

    if (!seller) {
        return next(new AppError('Seller not found', 404));
    }

    res.status(200).json(
        new ApiResponse(200, seller, 'Seller fetched successfully')
    );
});

/**
 * @desc    Approve a seller application
 * @route   PUT /api/v1/admin/sellers/:id/approve
 * @access  Private/Admin
 * 
 * This action:
 * 1. Sets seller status to 'approved'
 * 2. Updates the associated user's role to 'seller'
 * 
 * Once approved, the seller can start listing products.
 */
export const approveSeller = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const seller = await Seller.findById(req.params.id);

    if (!seller) {
        return next(new AppError('Seller not found', 404));
    }

    // Prevent re-approving already approved sellers
    if (seller.status === 'approved') {
        return next(new AppError('Seller is already approved', 400));
    }

    // Update seller status
    seller.status = 'approved';
    seller.adminRemarks = (req.body && req.body.remarks) ? req.body.remarks : 'Approved by Admin';
    await seller.save();

    // Update the user's role to 'seller' so they have seller permissions
    await User.findByIdAndUpdate(seller.user, { role: 'seller' });

    res.status(200).json(
        new ApiResponse(200, seller, 'Seller approved successfully')
    );
});

/**
 * @desc    Reject a seller application
 * @route   PUT /api/v1/admin/sellers/:id/reject
 * @body    { remarks: string } - Reason for rejection (mandatory)
 * @access  Private/Admin
 * 
 * Rejection should include remarks to inform the seller why their application was rejected.
 * The seller's user role remains 'user' (not upgraded to 'seller').
 */
export const rejectSeller = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { remarks } = req.body;

    // Rejection MUST have a reason for transparency
    if (!remarks) {
        return next(new AppError('Please provide a reason for rejection', 400));
    }

    const seller = await Seller.findById(req.params.id);

    if (!seller) {
        return next(new AppError('Seller not found', 404));
    }

    // Prevent rejecting already rejected sellers (or handle re-evaluation if needed)
    if (seller.status === 'rejected') {
        return next(new AppError('Seller is already rejected', 400));
    }

    seller.status = 'rejected';
    seller.adminRemarks = remarks;
    await seller.save();

    // Note: If seller was previously approved and is now being rejected,
    // you may want to revoke their 'seller' role as well (edge case).
    // For now, we assume rejection happens before approval.

    res.status(200).json(
        new ApiResponse(200, seller, 'Seller rejected')
    );
});

/**
 * @desc    Suspend an approved seller
 * @route   PUT /api/v1/admin/sellers/:id/suspend
 * @body    { remarks: string } - Reason for suspension (mandatory)
 * @access  Private/Admin
 * 
 * Suspension is different from rejection:
 * - Rejection: Initial application denied.
 * - Suspension: Previously approved seller is temporarily disabled (e.g., policy violation).
 * 
 * This action:
 * 1. Sets seller status to 'suspended'
 * 2. Revokes 'seller' role from the user (downgrade to 'user')
 */
export const suspendSeller = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { remarks } = req.body;

    if (!remarks) {
        return next(new AppError('Please provide a reason for suspension', 400));
    }

    const seller = await Seller.findById(req.params.id);

    if (!seller) {
        return next(new AppError('Seller not found', 404));
    }

    if (seller.status !== 'approved') {
        return next(new AppError('Only approved sellers can be suspended', 400));
    }

    seller.status = 'suspended';
    seller.adminRemarks = remarks;
    await seller.save();

    // Downgrade user role back to 'user'
    await User.findByIdAndUpdate(seller.user, { role: 'user' });

    res.status(200).json(
        new ApiResponse(200, seller, 'Seller suspended successfully')
    );
});

/**
 * @desc    Reactivate a suspended seller
 * @route   PUT /api/v1/admin/sellers/:id/reactivate
 * @access  Private/Admin
 * 
 * Brings a suspended seller back to 'approved' status.
 */
export const reactivateSeller = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const seller = await Seller.findById(req.params.id);

    if (!seller) {
        return next(new AppError('Seller not found', 404));
    }

    if (seller.status !== 'suspended') {
        return next(new AppError('Only suspended sellers can be reactivated', 400));
    }

    seller.status = 'approved';
    seller.adminRemarks = (req.body && req.body.remarks) ? req.body.remarks : 'Reactivated by Admin';
    await seller.save();

    // Restore seller role
    await User.findByIdAndUpdate(seller.user, { role: 'seller' });

    res.status(200).json(
        new ApiResponse(200, seller, 'Seller reactivated successfully')
    );
});

// ============================================
// PRODUCT MANAGEMENT (Admin)
// ============================================

import Product from '../models/productModel';

/**
 * @desc    Get all products (with optional status filter)
 * @route   GET /api/v1/admin/products
 * @query   status - Filter by status (pending, approved, rejected)
 * @access  Private/Admin
 * 
 * This endpoint allows admins to view all products across all sellers.
 */
export const getAllProducts = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const queryObj: { archived: boolean; status?: string } = {
        archived: false, // Exclude archived products
    };

    if (req.query.status) {
        const allowedStatuses = ['pending', 'approved', 'rejected'];
        if (!allowedStatuses.includes(req.query.status as string)) {
            return next(new AppError(`Invalid status. Allowed: ${allowedStatuses.join(', ')}`, 400));
        }
        queryObj.status = req.query.status as string;
    }

    const products = await Product.find(queryObj)
        .populate({
            path: 'seller',
            select: 'name email', // Get seller info
        })
        .sort({ createdAt: -1 });

    res.status(200).json(
        new ApiResponse(200, { count: products.length, products }, 'Products fetched successfully')
    );
});

/**
 * @desc    Get a single product by ID
 * @route   GET /api/v1/admin/products/:id
 * @access  Private/Admin
 */
export const getProductByIdAdmin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const product = await Product.findById(req.params.id).populate({
        path: 'seller',
        select: 'name email',
    });

    if (!product) {
        return next(new AppError('Product not found', 404));
    }

    res.status(200).json(
        new ApiResponse(200, product, 'Product fetched successfully')
    );
});

/**
 * @desc    Approve a product
 * @route   PUT /api/v1/admin/products/:id/approve
 * @access  Private/Admin
 * 
 * Makes the product visible on the storefront.
 */
export const approveProduct = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        return next(new AppError('Product not found', 404));
    }

    if (product.status === 'approved') {
        return next(new AppError('Product is already approved', 400));
    }

    product.status = 'approved';
    product.adminRemarks = (req.body && req.body.remarks) ? req.body.remarks : 'Approved by Admin';
    await product.save();

    res.status(200).json(
        new ApiResponse(200, product, 'Product approved successfully')
    );
});

/**
 * @desc    Reject a product
 * @route   PUT /api/v1/admin/products/:id/reject
 * @body    { remarks: string } - Reason for rejection (mandatory)
 * @access  Private/Admin
 */
export const rejectProduct = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { remarks } = req.body;

    if (!remarks) {
        return next(new AppError('Please provide a reason for rejection', 400));
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
        return next(new AppError('Product not found', 404));
    }

    if (product.status === 'rejected') {
        return next(new AppError('Product is already rejected', 400));
    }

    product.status = 'rejected';
    product.adminRemarks = remarks;
    await product.save();

    res.status(200).json(
        new ApiResponse(200, product, 'Product rejected')
    );
});

// ============================================
// USER MANAGEMENT (Admin)
// ============================================

/**
 * @desc    Get all users
 * @route   GET /api/v1/admin/users
 * @query   role - Filter by role (user, seller, admin)
 * @access  Private/Admin
 */
export const getAllUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const queryObj: { role?: string } = {};

    if (req.query.role) {
        queryObj.role = req.query.role as string;
    }

    const users = await User.find(queryObj).sort({ createdAt: -1 });

    res.status(200).json(
        new ApiResponse(200, { count: users.length, users }, 'Users fetched successfully')
    );
});

/**
 * @desc    Get single user
 * @route   GET /api/v1/admin/users/:id
 * @access  Private/Admin
 */
export const getUserByIdAdmin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new AppError('User not found', 404));
    }

    res.status(200).json(
        new ApiResponse(200, user, 'User fetched successfully')
    );
});

/**
 * @desc    Update user status (Suspend/Activate)
 * @route   PUT /api/v1/admin/users/:id/status
 * @body    { isActive: boolean }
 * @access  Private/Admin
 */
export const updateUserStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
        return next(new AppError('Please provide isActive status', 400));
    }

    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new AppError('User not found', 404));
    }

    // Prevent suspending self
    if (user._id.toString() === req.user!._id.toString()) {
        return next(new AppError('Cannot update your own status', 400));
    }

    user.isActive = isActive;
    await user.save();

    res.status(200).json(
        new ApiResponse(200, user, `User ${isActive ? 'activated' : 'suspended'} successfully`)
    );
});

/**
 * @desc    Delete user
 * @route   DELETE /api/v1/admin/users/:id
 * @access  Private/Admin
 */
export const deleteUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new AppError('User not found', 404));
    }

    // Prevent deleting self
    if (user._id.toString() === req.user!._id.toString()) {
        return next(new AppError('Cannot delete yourself', 400));
    }

    await user.deleteOne();

    res.status(200).json(
        new ApiResponse(200, {}, 'User deleted successfully')
    );
});
