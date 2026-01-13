
import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Order from '../models/orderModel';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import { ApiResponse } from '../utils/ApiResponse';

/**
 * @desc    Get orders containing seller's products
 * @route   GET /api/v1/seller-orders
 * @query   status - Filter by status
 * @query   page, limit - Pagination
 * @access  Private/Seller
 * 
 * This endpoint returns orders that contain at least one item 
 * belonging to the logged-in seller. Each order shows only
 * the seller's items, not items from other sellers.
 */
export const getSellerOrders = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const sellerId = req.user!._id;

    // Build base query - find orders with items from this seller
    const matchStage: Record<string, any> = {
        'items.seller': new mongoose.Types.ObjectId(sellerId.toString()),
    };

    // Status filter
    if (req.query.status) {
        matchStage.status = req.query.status;
    }

    // Pagination
    const page = parseInt(req.query.page as string, 10) || 1;
    let limit = parseInt(req.query.limit as string, 10) || 10;
    if (limit > 50) limit = 50;
    const skip = (page - 1) * limit;

    // Use aggregation to filter items per seller
    const orders = await Order.aggregate([
        // Match orders containing seller's items
        { $match: matchStage },

        // Sort by newest first
        { $sort: { createdAt: -1 } },

        // Pagination
        { $skip: skip },
        { $limit: limit },

        // Project only necessary fields and filter items to seller's only
        {
            $project: {
                orderNumber: 1,
                user: 1,
                guestInfo: 1,
                shippingAddress: 1,
                status: 1,
                paymentInfo: 1,
                createdAt: 1,
                // Filter items to only include seller's products
                items: {
                    $filter: {
                        input: '$items',
                        as: 'item',
                        cond: { $eq: ['$$item.seller', new mongoose.Types.ObjectId(sellerId.toString())] },
                    },
                },
                // Calculate seller's portion of the order
                sellerTotal: {
                    $reduce: {
                        input: {
                            $filter: {
                                input: '$items',
                                as: 'item',
                                cond: { $eq: ['$$item.seller', new mongoose.Types.ObjectId(sellerId.toString())] },
                            },
                        },
                        initialValue: 0,
                        in: { $add: ['$$value', '$$this.itemTotal'] },
                    },
                },
            },
        },
    ]);

    // Get total count for pagination
    const totalResult = await Order.aggregate([
        { $match: matchStage },
        { $count: 'total' },
    ]);
    const total = totalResult[0]?.total || 0;

    res.status(200).json(
        new ApiResponse(200, {
            orders,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        }, 'Seller orders fetched successfully')
    );
});

/**
 * @desc    Get single order details for seller
 * @route   GET /api/v1/seller-orders/:id
 * @access  Private/Seller
 * 
 * Returns order details with only the seller's items visible.
 */
export const getSellerOrderById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const sellerId = req.user!._id;
    const orderId = req.params.id as string;

    const orders = await Order.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(orderId),
                'items.seller': new mongoose.Types.ObjectId(sellerId.toString()),
            },
        },
        {
            $project: {
                orderNumber: 1,
                user: 1,
                guestInfo: 1,
                shippingAddress: 1,
                status: 1,
                statusHistory: 1,
                paymentInfo: 1,
                notes: 1,
                createdAt: 1,
                updatedAt: 1,
                items: {
                    $filter: {
                        input: '$items',
                        as: 'item',
                        cond: { $eq: ['$$item.seller', new mongoose.Types.ObjectId(sellerId.toString())] },
                    },
                },
                sellerTotal: {
                    $reduce: {
                        input: {
                            $filter: {
                                input: '$items',
                                as: 'item',
                                cond: { $eq: ['$$item.seller', new mongoose.Types.ObjectId(sellerId.toString())] },
                            },
                        },
                        initialValue: 0,
                        in: { $add: ['$$value', '$$this.itemTotal'] },
                    },
                },
            },
        },
    ]);

    if (!orders.length) {
        return next(new AppError('Order not found or does not contain your products', 404));
    }

    res.status(200).json(
        new ApiResponse(200, orders[0], 'Order fetched successfully')
    );
});

/**
 * @desc    Update order status (Seller)
 * @route   PUT /api/v1/seller-orders/:id/status
 * @body    { status: string, note?: string }
 * @access  Private/Seller
 * 
 * Sellers can update order status for orders containing their products.
 * 
 * Allowed status transitions for sellers:
 * - paid -> processing (Seller starts working on order)
 * - processing -> shipped (Seller dispatches order)
 * 
 * Note: In a multi-vendor order, this updates the entire order status.
 * For more granular control, implement per-item status tracking.
 */
export const updateOrderStatusSeller = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const sellerId = req.user!._id;
    const orderId = req.params.id;
    const { status, note } = req.body;

    // 1. Validate status
    const allowedSellerStatuses = ['processing', 'shipped'];
    if (!status || !allowedSellerStatuses.includes(status)) {
        return next(new AppError(`Invalid status. Sellers can set: ${allowedSellerStatuses.join(', ')}`, 400));
    }

    // 2. Find order that contains seller's products
    const order = await Order.findOne({
        _id: orderId,
        'items.seller': sellerId,
    });

    if (!order) {
        return next(new AppError('Order not found or does not contain your products', 404));
    }

    // 3. Validate status transition
    const validTransitions: Record<string, string[]> = {
        paid: ['processing'],
        processing: ['shipped'],
    };

    if (!validTransitions[order.status]?.includes(status)) {
        return next(
            new AppError(
                `Cannot change status from "${order.status}" to "${status}". ` +
                `Allowed: ${validTransitions[order.status]?.join(', ') || 'none'}`,
                400
            )
        );
    }

    // 4. Update status
    order.status = status;
    order.statusHistory.push({
        status,
        timestamp: new Date(),
        note: note || `Status updated to ${status} by seller`,
    });

    await order.save();

    res.status(200).json(
        new ApiResponse(200, order, `Order status updated to "${status}"`)
    );
});

/**
 * @desc    Get all orders (Admin)
 * @route   GET /api/v1/admin/orders
 * @query   status, sellerId, userId - Filters
 * @query   page, limit - Pagination
 * @access  Private/Admin
 */
export const getAllOrdersAdmin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const queryObj: Record<string, any> = {};

    // Filters
    if (req.query.status) {
        queryObj.status = req.query.status;
    }
    if (req.query.sellerId) {
        queryObj['items.seller'] = req.query.sellerId;
    }
    if (req.query.userId) {
        queryObj.user = req.query.userId;
    }

    // Pagination
    const page = parseInt(req.query.page as string, 10) || 1;
    let limit = parseInt(req.query.limit as string, 10) || 10;
    if (limit > 100) limit = 100;
    const skip = (page - 1) * limit;

    const total = await Order.countDocuments(queryObj);
    const orders = await Order.find(queryObj)
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    res.status(200).json(
        new ApiResponse(200, {
            orders,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        }, 'Orders fetched successfully')
    );
});

/**
 * @desc    Get single order details (Admin)
 * @route   GET /api/v1/admin/orders/:id
 * @access  Private/Admin
 */
export const getOrderByIdAdmin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const order = await Order.findById(req.params.id)
        .populate('user', 'name email')
        .populate('items.seller', 'name email');

    if (!order) {
        return next(new AppError('Order not found', 404));
    }

    res.status(200).json(
        new ApiResponse(200, order, 'Order fetched successfully')
    );
});

/**
 * @desc    Update order status (Admin)
 * @route   PUT /api/v1/admin/orders/:id/status
 * @body    { status: string, note?: string }
 * @access  Private/Admin
 * 
 * Admins can update order to any valid status.
 * Used for:
 * - Marking orders as delivered
 * - Handling cancellations
 * - Processing refunds
 */
export const updateOrderStatusAdmin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { status, note } = req.body;

    // 1. Validate status
    const validStatuses = ['created', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
    if (!status || !validStatuses.includes(status)) {
        return next(new AppError(`Invalid status. Allowed: ${validStatuses.join(', ')}`, 400));
    }

    // 2. Find order
    const order = await Order.findById(req.params.id);

    if (!order) {
        return next(new AppError('Order not found', 404));
    }

    // 3. Prevent invalid transitions
    const invalidTransitions: Record<string, string[]> = {
        delivered: ['created', 'paid', 'processing'], // Cannot go back from delivered
        cancelled: ['processing', 'shipped', 'delivered'], // Cannot cancel after these
        refunded: ['created'], // Cannot refund unpaid order
    };

    if (invalidTransitions[order.status]?.includes(status)) {
        return next(new AppError(`Cannot change status from "${order.status}" to "${status}"`, 400));
    }

    // 4. Update status
    const previousStatus = order.status;
    order.status = status;
    order.statusHistory.push({
        status,
        timestamp: new Date(),
        note: note || `Status changed from "${previousStatus}" to "${status}" by admin`,
    });

    await order.save();

    res.status(200).json(
        new ApiResponse(200, order, `Order status updated to "${status}"`)
    );
});

/**
 * @desc    Get order statistics (Admin Dashboard)
 * @route   GET /api/v1/admin/orders/stats
 * @access  Private/Admin
 * 
 * Returns aggregated order statistics for dashboard.
 */
export const getOrderStats = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // Get order counts by status
    const statusCounts = await Order.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
            },
        },
    ]);

    // Get total revenue (paid orders)
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
                orderCount: { $sum: 1 },
            },
        },
    ]);

    // Get today's orders
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = await Order.countDocuments({
        createdAt: { $gte: today },
    });

    // Get this month's revenue
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthlyRevenueResult = await Order.aggregate([
        {
            $match: {
                createdAt: { $gte: firstDayOfMonth },
                status: { $in: ['paid', 'processing', 'shipped', 'delivered'] },
            },
        },
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: '$totalAmount' },
                orderCount: { $sum: 1 },
            },
        },
    ]);

    res.status(200).json(
        new ApiResponse(200, {
            statusCounts: statusCounts.reduce((acc, curr) => {
                acc[curr._id] = curr.count;
                return acc;
            }, {} as Record<string, number>),
            totalRevenue: revenueResult[0]?.totalRevenue || 0,
            totalPaidOrders: revenueResult[0]?.orderCount || 0,
            todayOrders,
            monthlyRevenue: monthlyRevenueResult[0]?.totalRevenue || 0,
            monthlyOrders: monthlyRevenueResult[0]?.orderCount || 0,
        }, 'Order statistics fetched successfully')
    );
});
