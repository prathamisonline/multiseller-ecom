
import { Request, Response, NextFunction } from 'express';
import Product from '../models/productModel';
import Seller from '../models/sellerModel';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import { ApiResponse } from '../utils/ApiResponse';

/**
 * @desc    Create a new product
 * @route   POST /api/v1/products
 * @access  Private/Seller (Approved sellers only)
 * 
 * This endpoint allows approved sellers to add products to the catalog.
 * Products are created with status 'pending' and require admin approval.
 */
export const createProduct = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { name, description, price, mrp, stock, category, images, attributes } = req.body;

    // 1. Verify the user is an approved seller
    //    req.user is populated by 'protect' middleware
    const seller = await Seller.findOne({ user: req.user!._id });

    if (!seller) {
        return next(new AppError('You must be a registered seller to create products', 403));
    }

    if (seller.status !== 'approved') {
        return next(new AppError('Your seller account must be approved to create products', 403));
    }

    // 2. Create the product
    const product = await Product.create({
        seller: req.user!._id,
        name,
        description,
        price,
        mrp,
        stock,
        category,
        images: images || [],
        attributes: attributes || [],
        // status defaults to 'pending'
    });

    res.status(201).json(
        new ApiResponse(201, product, 'Product created successfully. Pending admin approval.')
    );
});

/**
 * @desc    Get all products for the logged-in seller
 * @route   GET /api/v1/products/my-products
 * @query   status - Filter by status (pending, approved, rejected)
 * @access  Private/Seller
 * 
 * Sellers can view their own products and filter by approval status.
 */
export const getMyProducts = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // Build query
    const queryObj: { seller: mongoose.Types.ObjectId; archived: boolean; status?: string } = {
        seller: req.user!._id,
        archived: false, // Exclude archived (soft-deleted) products
    };

    if (req.query.status) {
        queryObj.status = req.query.status as string;
    }

    const products = await Product.find(queryObj).sort({ createdAt: -1 });

    res.status(200).json(
        new ApiResponse(200, { count: products.length, products }, 'Products fetched successfully')
    );
});

/**
 * @desc    Get a single product by ID (Seller view)
 * @route   GET /api/v1/products/:id
 * @access  Private/Seller (Owner only)
 * 
 * Sellers can only view their own products.
 */
export const getProductById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        return next(new AppError('Product not found', 404));
    }

    // Ownership check: Ensure the seller owns this product
    if (product.seller.toString() !== req.user!._id.toString()) {
        return next(new AppError('Not authorized to view this product', 403));
    }

    res.status(200).json(
        new ApiResponse(200, product, 'Product fetched successfully')
    );
});

/**
 * @desc    Update a product
 * @route   PUT /api/v1/products/:id
 * @access  Private/Seller (Owner only)
 * 
 * Sellers can update their products. Updating a product resets its status to 'pending'
 * if it was previously approved (to require re-approval for significant changes).
 * 
 * Note: In production, you might allow minor updates (like stock) without re-approval.
 */
export const updateProduct = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    let product = await Product.findById(req.params.id);

    if (!product) {
        return next(new AppError('Product not found', 404));
    }

    // Ownership check
    if (product.seller.toString() !== req.user!._id.toString()) {
        return next(new AppError('Not authorized to update this product', 403));
    }

    // Fields that can be updated by seller
    const allowedUpdates = ['name', 'description', 'price', 'mrp', 'stock', 'category', 'images', 'attributes'];
    const updates: Record<string, any> = {};

    allowedUpdates.forEach((field) => {
        if (req.body[field] !== undefined) {
            updates[field] = req.body[field];
        }
    });

    // If key fields are updated, reset status to pending for re-approval
    // (Stock updates might not need re-approval in production)
    const significantFields = ['name', 'description', 'price', 'mrp', 'category', 'images'];
    const needsReApproval = significantFields.some((f) => Object.keys(updates).includes(f));

    if (needsReApproval && product.status === 'approved') {
        updates.status = 'pending';
        updates.adminRemarks = 'Re-submitted for approval after update';
    }

    product = await Product.findByIdAndUpdate(req.params.id, updates, {
        new: true, // Return updated document
        runValidators: true, // Run schema validators on update
    });

    res.status(200).json(
        new ApiResponse(200, product, needsReApproval ? 'Product updated. Re-approval required.' : 'Product updated successfully.')
    );
});

/**
 * @desc    Delete a product (Soft delete)
 * @route   DELETE /api/v1/products/:id
 * @access  Private/Seller (Owner only)
 * 
 * Soft delete: Sets 'archived: true' instead of removing from database.
 * This preserves order history and references.
 */
export const deleteProduct = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        return next(new AppError('Product not found', 404));
    }

    // Ownership check
    if (product.seller.toString() !== req.user!._id.toString()) {
        return next(new AppError('Not authorized to delete this product', 403));
    }

    // Soft delete
    product.archived = true;
    await product.save();

    res.status(200).json(
        new ApiResponse(200, null, 'Product deleted successfully')
    );
});

// We need mongoose for the ObjectId type
import mongoose from 'mongoose';
