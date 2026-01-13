
import { Request, Response, NextFunction } from 'express';
import Seller from '../models/sellerModel';
import User from '../models/userModel';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import { ApiResponse } from '../utils/ApiResponse';

/**
 * @desc    Register a new seller account (Onboarding)
 * @route   POST /api/v1/sellers/register
 * @access  Private (Authenticated Users)
 */
export const registerSeller = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { storeName, description, storeDescription, businessDetails, bankDetails } = req.body;

    // 1. Check if user already has a seller profile
    const existingSeller = await Seller.findOne({ user: req.user!._id });

    if (existingSeller) {
        return next(new AppError('User already has a seller profile', 400));
    }

    // 2. Validate mandatory business details
    if (!businessDetails || !businessDetails.address) {
        return next(new AppError('Please provide mandatory business details (Address)', 400));
    }

    // Ensure PAN is present (required by model)
    if (!businessDetails.pan) {
        // For testing, if not provided, we can assign a placeholder or return error
        // But the model says it's required.
        return next(new AppError('Please provide PAN number', 400));
    }

    // 3. Create the Seller Profile
    const seller = await Seller.create({
        user: req.user!._id,
        storeName,
        description: description || storeDescription,
        businessDetails,
        bankDetails,
    });

    res.status(201).json(
        new ApiResponse(201, seller, 'Seller application submitted successfully. Pending Admin approval.')
    );
});

/**
 * @desc    Get current seller profile
 * @route   GET /api/v1/sellers/me
 * @access  Private (Seller/User)
 */
export const getMySellerProfile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const seller = await Seller.findOne({ user: req.user!._id });

    if (!seller) {
        return next(new AppError('No seller profile found for this user', 404));
    }

    res.status(200).json(
        new ApiResponse(200, seller, 'Seller profile fetched successfully')
    );
});
