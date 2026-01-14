
import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Order from '../models/orderModel';
import Seller from '../models/sellerModel';
import { catchAsync } from '../utils/catchAsync';
import { ApiResponse } from '../utils/ApiResponse';

/**
 * @desc    Get global financial stats
 * @route   GET /api/v1/admin/finance/stats
 * @access  Private/Admin
 */
export const getFinanceStats = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // 1. Total Platform Revenue (Sum of commissionAmount from all orders)
    // 2. Total Seller Earnings (Sum of sellerEarnings from all orders)
    // 3. Pending Payouts (Sum of sellerEarnings for delivered orders)

    const stats = await Order.aggregate([
        {
            $match: {
                status: { $in: ['paid', 'processing', 'shipped', 'delivered'] } // Valid orders
            }
        },
        { $unwind: '$items' }, // Deconstruct items array
        {
            $group: {
                _id: null,
                totalPlatformRevenue: { $sum: '$items.commissionAmount' },
                totalSellerEarnings: { $sum: '$items.sellerEarnings' },
                totalGMV: { $sum: '$items.itemTotal' }
            }
        }
    ]);

    // Calculate Pending Payouts (only 'delivered' orders are eligible for payout usually)
    const pendingPayouts = await Order.aggregate([
        {
            $match: {
                status: 'delivered'
            }
        },
        { $unwind: '$items' },
        {
            $group: {
                _id: null,
                amount: { $sum: '$items.sellerEarnings' }
            }
        }
    ]);

    res.status(200).json(
        new ApiResponse(200, {
            totalPlatformRevenue: stats[0]?.totalPlatformRevenue || 0,
            totalSellerEarnings: stats[0]?.totalSellerEarnings || 0,
            totalGMV: stats[0]?.totalGMV || 0,
            pendingPayouts: pendingPayouts[0]?.amount || 0
        }, 'Finance stats fetched successfully')
    );
});

/**
 * @desc    Get payout list per seller
 * @route   GET /api/v1/admin/finance/payouts
 * @access  Private/Admin
 */
export const getPayouts = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // Group earnings by seller
    const payouts = await Order.aggregate([
        {
            $match: {
                status: { $in: ['paid', 'processing', 'shipped', 'delivered'] }
            }
        },
        { $unwind: '$items' },
        {
            $group: {
                _id: '$items.seller',
                totalEarnings: { $sum: '$items.sellerEarnings' },
                totalCommission: { $sum: '$items.commissionAmount' },
                ordersCount: { $sum: 1 }
            }
        },
        {
            $lookup: {
                from: 'sellers',
                localField: '_id',
                foreignField: 'user',
                as: 'sellerInfo'
            }
        },
        {
            $project: {
                _id: 1,
                totalEarnings: 1,
                totalCommission: 1,
                ordersCount: 1,
                storeName: { $arrayElemAt: ['$sellerInfo.storeName', 0] },
                bankDetails: { $arrayElemAt: ['$sellerInfo.bankDetails', 0] }
            }
        }
    ]);

    res.status(200).json(
        new ApiResponse(200, payouts, 'Payouts fetched successfully')
    );
});
