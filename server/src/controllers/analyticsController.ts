
import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Order from '../models/orderModel';
import Product from '../models/productModel';
import User from '../models/userModel';
import Seller from '../models/sellerModel';
import { catchAsync } from '../utils/catchAsync';
import { ApiResponse } from '../utils/ApiResponse';

/**
 * Analytics Controller
 * 
 * Provides comprehensive analytics for:
 * - Admin Dashboard (Platform-wide stats)
 * - Seller Dashboard (Seller-specific stats)
 * 
 * Key Metrics:
 * - Revenue (total, monthly, daily)
 * - Order counts and status distribution
 * - Top-selling products
 * - User/Seller counts
 * - Trend data for charts
 */

// ============================================
// ADMIN ANALYTICS
// ============================================

/**
 * @desc    Get platform overview stats
 * @route   GET /api/v1/analytics/admin/overview
 * @access  Private/Admin
 * 
 * Returns key metrics for admin dashboard header cards.
 */
export const getAdminOverview = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // 1. Total Revenue (from paid orders)
    const revenueResult = await Order.aggregate([
        {
            $match: {
                status: { $in: ['paid', 'processing', 'shipped', 'delivered'] },
            },
        },
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: '$totalAmount' },
                totalOrders: { $sum: 1 },
            },
        },
    ]);

    // 2. User counts
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalSellers = await Seller.countDocuments({ status: 'approved' });
    const pendingSellers = await Seller.countDocuments({ status: 'pending' });

    // 3. Product counts
    const totalProducts = await Product.countDocuments({ status: 'approved', archived: false });
    const pendingProducts = await Product.countDocuments({ status: 'pending', archived: false });

    // 4. Today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = await Order.countDocuments({
        createdAt: { $gte: today },
    });

    const todayRevenueResult = await Order.aggregate([
        {
            $match: {
                createdAt: { $gte: today },
                status: { $in: ['paid', 'processing', 'shipped', 'delivered'] },
            },
        },
        {
            $group: {
                _id: null,
                revenue: { $sum: '$totalAmount' },
            },
        },
    ]);

    // 5. Pending orders
    const pendingOrders = await Order.countDocuments({ status: { $in: ['paid', 'processing'] } });

    res.status(200).json(
        new ApiResponse(200, {
            revenue: {
                total: revenueResult[0]?.totalRevenue || 0,
                today: todayRevenueResult[0]?.revenue || 0,
            },
            orders: {
                total: revenueResult[0]?.totalOrders || 0,
                today: todayOrders,
                pending: pendingOrders,
            },
            users: {
                total: totalUsers,
            },
            sellers: {
                total: totalSellers,
                pending: pendingSellers,
            },
            products: {
                total: totalProducts,
                pending: pendingProducts,
            },
        }, 'Admin overview fetched successfully')
    );
});

/**
 * @desc    Get revenue analytics with time breakdown
 * @route   GET /api/v1/analytics/admin/revenue
 * @query   period - 'daily' | 'weekly' | 'monthly' (default: 'daily')
 * @query   days - Number of days to look back (default: 30)
 * @access  Private/Admin
 * 
 * Returns revenue data for charts.
 */
export const getRevenueAnalytics = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const period = (req.query.period as string) || 'daily';
    const days = parseInt(req.query.days as string, 10) || 30;

    // Calculate start date
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // Define grouping based on period
    let dateFormat: any;
    switch (period) {
        case 'monthly':
            dateFormat = {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' },
            };
            break;
        case 'weekly':
            dateFormat = {
                year: { $year: '$createdAt' },
                week: { $isoWeek: '$createdAt' },
            };
            break;
        default: // daily
            dateFormat = {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' },
                day: { $dayOfMonth: '$createdAt' },
            };
    }

    const revenueData = await Order.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate },
                status: { $in: ['paid', 'processing', 'shipped', 'delivered'] },
            },
        },
        {
            $group: {
                _id: dateFormat,
                revenue: { $sum: '$totalAmount' },
                orders: { $sum: 1 },
            },
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 } },
    ]);

    // Format data for frontend
    const formattedData = revenueData.map((item) => {
        let label = '';
        if (period === 'monthly') {
            label = `${item._id.year}-${String(item._id.month).padStart(2, '0')}`;
        } else if (period === 'weekly') {
            label = `${item._id.year}-W${item._id.week}`;
        } else {
            label = `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')}`;
        }
        return {
            date: label,
            revenue: item.revenue,
            orders: item.orders,
        };
    });

    res.status(200).json(
        new ApiResponse(200, {
            period,
            days,
            data: formattedData,
        }, 'Revenue analytics fetched successfully')
    );
});

/**
 * @desc    Get order status distribution
 * @route   GET /api/v1/analytics/admin/orders/status
 * @access  Private/Admin
 * 
 * Returns order counts by status for pie/donut charts.
 */
export const getOrderStatusDistribution = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const statusCounts = await Order.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
            },
        },
    ]);

    // Convert to object format
    const distribution = statusCounts.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
    }, {} as Record<string, number>);

    res.status(200).json(
        new ApiResponse(200, distribution, 'Order status distribution fetched')
    );
});

/**
 * @desc    Get top selling products
 * @route   GET /api/v1/analytics/admin/products/top
 * @query   limit - Number of products (default: 10)
 * @access  Private/Admin
 * 
 * Returns products with highest sales volume.
 */
export const getTopSellingProducts = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const limit = parseInt(req.query.limit as string, 10) || 10;

    const topProducts = await Order.aggregate([
        // Only consider paid orders
        {
            $match: {
                status: { $in: ['paid', 'processing', 'shipped', 'delivered'] },
            },
        },
        // Unwind items array
        { $unwind: '$items' },
        // Group by product
        {
            $group: {
                _id: '$items.product',
                productName: { $first: '$items.name' },
                productImage: { $first: '$items.image' },
                totalQuantity: { $sum: '$items.quantity' },
                totalRevenue: { $sum: '$items.itemTotal' },
                orderCount: { $sum: 1 },
            },
        },
        // Sort by quantity sold
        { $sort: { totalQuantity: -1 } },
        // Limit results
        { $limit: limit },
    ]);

    res.status(200).json(
        new ApiResponse(200, topProducts, 'Top selling products fetched')
    );
});

/**
 * @desc    Get top sellers by revenue
 * @route   GET /api/v1/analytics/admin/sellers/top
 * @query   limit - Number of sellers (default: 10)
 * @access  Private/Admin
 */
export const getTopSellers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const limit = parseInt(req.query.limit as string, 10) || 10;

    const topSellers = await Order.aggregate([
        {
            $match: {
                status: { $in: ['paid', 'processing', 'shipped', 'delivered'] },
            },
        },
        { $unwind: '$items' },
        {
            $group: {
                _id: '$items.seller',
                totalRevenue: { $sum: '$items.itemTotal' },
                totalOrders: { $sum: 1 },
                totalProducts: { $addToSet: '$items.product' },
            },
        },
        {
            $project: {
                seller: '$_id',
                totalRevenue: 1,
                totalOrders: 1,
                uniqueProducts: { $size: '$totalProducts' },
            },
        },
        { $sort: { totalRevenue: -1 } },
        { $limit: limit },
        // Lookup seller details
        {
            $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'sellerInfo',
            },
        },
        {
            $lookup: {
                from: 'sellers',
                localField: '_id',
                foreignField: 'user',
                as: 'sellerProfile',
            },
        },
        {
            $project: {
                totalRevenue: 1,
                totalOrders: 1,
                uniqueProducts: 1,
                sellerName: { $arrayElemAt: ['$sellerInfo.name', 0] },
                storeName: { $arrayElemAt: ['$sellerProfile.storeName', 0] },
            },
        },
    ]);

    res.status(200).json(
        new ApiResponse(200, topSellers, 'Top sellers fetched')
    );
});

// ============================================
// SELLER ANALYTICS
// ============================================

/**
 * @desc    Get seller dashboard overview
 * @route   GET /api/v1/analytics/seller/overview
 * @access  Private/Seller
 * 
 * Returns key metrics for seller dashboard.
 */
export const getSellerOverview = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const sellerId = req.user!._id;

    // 1. Revenue from seller's products
    const revenueResult = await Order.aggregate([
        {
            $match: {
                status: { $in: ['paid', 'processing', 'shipped', 'delivered'] },
                'items.seller': new mongoose.Types.ObjectId(sellerId.toString()),
            },
        },
        { $unwind: '$items' },
        {
            $match: {
                'items.seller': new mongoose.Types.ObjectId(sellerId.toString()),
            },
        },
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: '$items.itemTotal' },
                totalOrders: { $addToSet: '$_id' },
            },
        },
        {
            $project: {
                totalRevenue: 1,
                totalOrders: { $size: '$totalOrders' },
            },
        },
    ]);

    // 2. Product counts
    const totalProducts = await Product.countDocuments({
        seller: sellerId,
        archived: false,
    });
    const approvedProducts = await Product.countDocuments({
        seller: sellerId,
        status: 'approved',
        archived: false,
    });
    const pendingProducts = await Product.countDocuments({
        seller: sellerId,
        status: 'pending',
        archived: false,
    });

    // 3. Today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayRevenueResult = await Order.aggregate([
        {
            $match: {
                createdAt: { $gte: today },
                status: { $in: ['paid', 'processing', 'shipped', 'delivered'] },
                'items.seller': new mongoose.Types.ObjectId(sellerId.toString()),
            },
        },
        { $unwind: '$items' },
        {
            $match: {
                'items.seller': new mongoose.Types.ObjectId(sellerId.toString()),
            },
        },
        {
            $group: {
                _id: null,
                revenue: { $sum: '$items.itemTotal' },
                orders: { $addToSet: '$_id' },
            },
        },
    ]);

    // 4. Pending orders (orders with seller's items that need action)
    const pendingOrders = await Order.countDocuments({
        status: { $in: ['paid', 'processing'] },
        'items.seller': sellerId,
    });

    res.status(200).json(
        new ApiResponse(200, {
            revenue: {
                total: revenueResult[0]?.totalRevenue || 0,
                today: todayRevenueResult[0]?.revenue || 0,
            },
            orders: {
                total: revenueResult[0]?.totalOrders || 0,
                today: todayRevenueResult[0]?.orders?.length || 0,
                pending: pendingOrders,
            },
            products: {
                total: totalProducts,
                approved: approvedProducts,
                pending: pendingProducts,
            },
        }, 'Seller overview fetched successfully')
    );
});

/**
 * @desc    Get seller revenue analytics
 * @route   GET /api/v1/analytics/seller/revenue
 * @query   days - Number of days to look back (default: 30)
 * @access  Private/Seller
 */
export const getSellerRevenueAnalytics = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const sellerId = req.user!._id;
    const days = parseInt(req.query.days as string, 10) || 30;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const revenueData = await Order.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate },
                status: { $in: ['paid', 'processing', 'shipped', 'delivered'] },
                'items.seller': new mongoose.Types.ObjectId(sellerId.toString()),
            },
        },
        { $unwind: '$items' },
        {
            $match: {
                'items.seller': new mongoose.Types.ObjectId(sellerId.toString()),
            },
        },
        {
            $group: {
                _id: {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' },
                    day: { $dayOfMonth: '$createdAt' },
                },
                revenue: { $sum: '$items.itemTotal' },
                quantity: { $sum: '$items.quantity' },
            },
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]);

    const formattedData = revenueData.map((item) => ({
        date: `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')}`,
        revenue: item.revenue,
        quantity: item.quantity,
    }));

    res.status(200).json(
        new ApiResponse(200, {
            days,
            data: formattedData,
        }, 'Seller revenue analytics fetched')
    );
});

/**
 * @desc    Get seller's top products
 * @route   GET /api/v1/analytics/seller/products/top
 * @query   limit - Number of products (default: 10)
 * @access  Private/Seller
 */
export const getSellerTopProducts = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const sellerId = req.user!._id;
    const limit = parseInt(req.query.limit as string, 10) || 10;

    const topProducts = await Order.aggregate([
        {
            $match: {
                status: { $in: ['paid', 'processing', 'shipped', 'delivered'] },
                'items.seller': new mongoose.Types.ObjectId(sellerId.toString()),
            },
        },
        { $unwind: '$items' },
        {
            $match: {
                'items.seller': new mongoose.Types.ObjectId(sellerId.toString()),
            },
        },
        {
            $group: {
                _id: '$items.product',
                productName: { $first: '$items.name' },
                productImage: { $first: '$items.image' },
                totalQuantity: { $sum: '$items.quantity' },
                totalRevenue: { $sum: '$items.itemTotal' },
            },
        },
        { $sort: { totalQuantity: -1 } },
        { $limit: limit },
    ]);

    res.status(200).json(
        new ApiResponse(200, topProducts, 'Seller top products fetched')
    );
});
