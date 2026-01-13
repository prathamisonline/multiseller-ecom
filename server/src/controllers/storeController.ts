
import { Request, Response, NextFunction } from 'express';
import Product from '../models/productModel';
import Seller from '../models/sellerModel';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import { ApiResponse } from '../utils/ApiResponse';

/**
 * @desc    Get all approved products (Public storefront)
 * @route   GET /api/v1/store/products
 * @query   
 *   - category: Filter by category (string)
 *   - minPrice: Minimum price filter (number)
 *   - maxPrice: Maximum price filter (number)
 *   - search: Search by product name (string, case-insensitive)
 *   - sort: Sort by field (price, -price, createdAt, -createdAt)
 *   - page: Page number for pagination (default: 1)
 *   - limit: Number of products per page (default: 10, max: 50)
 * @access  Public
 * 
 * This endpoint is for the customer-facing storefront. Only shows:
 * - Products with status 'approved'
 * - Non-archived products
 * - Products from approved sellers (optional check, recommended)
 */
export const getPublicProducts = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // ============================================
    // 1. BUILD QUERY OBJECT
    // ============================================

    // Base query: Only approved, non-archived products
    const queryObj: Record<string, any> = {
        status: 'approved',
        archived: false,
    };

    // Category filter (exact match, case-insensitive)
    if (req.query.category) {
        // Using regex for case-insensitive match
        queryObj.category = { $regex: new RegExp(`^${req.query.category}$`, 'i') };
    }

    // Price range filter
    if (req.query.minPrice || req.query.maxPrice) {
        queryObj.price = {};
        if (req.query.minPrice) {
            const min = parseFloat(req.query.minPrice as string);
            if (isNaN(min)) {
                return next(new AppError('minPrice must be a valid number', 400));
            }
            queryObj.price.$gte = min;
        }
        if (req.query.maxPrice) {
            const max = parseFloat(req.query.maxPrice as string);
            if (isNaN(max)) {
                return next(new AppError('maxPrice must be a valid number', 400));
            }
            queryObj.price.$lte = max;
        }
    }

    // Search by product name (partial match, case-insensitive)
    if (req.query.search) {
        queryObj.name = { $regex: req.query.search as string, $options: 'i' };
    }

    // ============================================
    // 2. PAGINATION
    // ============================================

    // Parse page and limit with defaults
    const page = parseInt(req.query.page as string, 10) || 1;
    let limit = parseInt(req.query.limit as string, 10) || 10;

    // Cap limit at 50 to prevent abuse
    if (limit > 50) limit = 50;
    if (limit < 1) limit = 10;

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // ============================================
    // 3. SORTING
    // ============================================

    // Default sort: newest first
    let sortBy = '-createdAt';

    if (req.query.sort) {
        const sortField = req.query.sort as string;
        // Allowed sort fields
        const allowedSorts = ['price', '-price', 'createdAt', '-createdAt', 'name', '-name'];
        if (allowedSorts.includes(sortField)) {
            sortBy = sortField;
        }
    }

    // ============================================
    // 4. EXECUTE QUERY
    // ============================================

    // Get total count for pagination metadata
    const total = await Product.countDocuments(queryObj);

    // Fetch products with pagination
    const products = await Product.find(queryObj)
        .populate({
            path: 'seller',
            select: 'name', // Only include seller name (for display purposes)
        })
        .select('-adminRemarks') // Exclude admin-only fields
        .sort(sortBy)
        .skip(skip)
        .limit(limit);

    // ============================================
    // 5. CALCULATE PAGINATION METADATA
    // ============================================

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // ============================================
    // 6. SEND RESPONSE
    // ============================================

    res.status(200).json(
        new ApiResponse(
            200,
            {
                products,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages,
                    hasNextPage,
                    hasPrevPage,
                },
            },
            'Products fetched successfully'
        )
    );
});

/**
 * @desc    Get single product by ID or Slug (Public)
 * @route   GET /api/v1/store/products/:identifier
 * @param   identifier - Product ID or slug
 * @access  Public
 * 
 * Supports lookup by either MongoDB ObjectId or slug for SEO-friendly URLs.
 */
export const getPublicProductByIdOrSlug = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const identifier = req.params.identifier as string;

    // Determine if identifier is an ObjectId or slug
    // MongoDB ObjectIds are 24 character hex strings
    const isObjectId = /^[a-fA-F0-9]{24}$/.test(identifier);

    let product;

    if (isObjectId) {
        product = await Product.findOne({
            _id: identifier,
            status: 'approved',
            archived: false,
        }).populate({
            path: 'seller',
            select: 'name',
        });
    } else {
        // Lookup by slug
        product = await Product.findOne({
            slug: identifier.toLowerCase(),
            status: 'approved',
            archived: false,
        }).populate({
            path: 'seller',
            select: 'name',
        });
    }

    if (!product) {
        return next(new AppError('Product not found', 404));
    }

    res.status(200).json(
        new ApiResponse(200, product, 'Product fetched successfully')
    );
});

/**
 * @desc    Get all unique categories (for filter UI)
 * @route   GET /api/v1/store/categories
 * @access  Public
 * 
 * Returns a list of unique categories from approved products.
 * Useful for building category filter dropdowns on the frontend.
 */
export const getCategories = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // Aggregate to get distinct categories from approved, non-archived products
    const categories = await Product.distinct('category', {
        status: 'approved',
        archived: false,
    });

    res.status(200).json(
        new ApiResponse(200, { categories }, 'Categories fetched successfully')
    );
});

/**
 * @desc    Get products by seller (Public store page)
 * @route   GET /api/v1/store/sellers/:sellerId/products
 * @access  Public
 * 
 * View all approved products from a specific seller.
 * Useful for seller store pages.
 */
export const getProductsBySeller = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { sellerId } = req.params;

    // Verify seller exists and is approved
    const seller = await Seller.findOne({ user: sellerId, status: 'approved' });

    if (!seller) {
        return next(new AppError('Seller not found or not active', 404));
    }

    // Pagination
    const page = parseInt(req.query.page as string, 10) || 1;
    let limit = parseInt(req.query.limit as string, 10) || 10;
    if (limit > 50) limit = 50;
    const skip = (page - 1) * limit;

    const queryObj = {
        seller: sellerId,
        status: 'approved',
        archived: false,
    };

    const total = await Product.countDocuments(queryObj);
    const products = await Product.find(queryObj)
        .select('-adminRemarks')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json(
        new ApiResponse(
            200,
            {
                seller: {
                    storeName: seller.storeName,
                    description: seller.description,
                    logoUrl: seller.logoUrl,
                },
                products,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1,
                },
            },
            'Seller products fetched successfully'
        )
    );
});
