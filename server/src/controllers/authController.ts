
import { Request, Response, NextFunction } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import { ApiResponse } from '../utils/ApiResponse';
import User from '../models/userModel';

// Get token from model, create cookie and send response
const sendTokenResponse = (user: any, statusCode: number, res: Response) => {
    const token = user.getSignedJwtToken();

    const options = {
        expires: new Date(
            Date.now() + parseInt(process.env.JWT_COOKIE_EXPIRE || '30') * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
    };

    if (process.env.NODE_ENV === 'production') {
        // options.secure = true; // Use this if using HTTPS
    }

    res
        .status(statusCode)
        // .cookie('token', token, options) // Optional: Send cookie
        .json(new ApiResponse(statusCode, { token, user }, 'Authentication successful'));
};

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
export const register = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password, role } = req.body;

    // Create user
    const user = await User.create({
        name,
        email,
        password,
        role,
    });

    sendTokenResponse(user, 201, res);
});

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
export const login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
        return next(new AppError('Please provide an email and password', 400));
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        return next(new AppError('Invalid credentials', 401));
    }

    // Check if user is suspended
    if (!user.isActive) {
        return next(new AppError('Your account has been suspended. Please contact support.', 403));
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
        return next(new AppError('Invalid credentials', 401));
    }

    sendTokenResponse(user, 200, res);
});

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
export const getMe = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findById(req.user!._id);

    res.status(200).json(new ApiResponse(200, user, 'User details fetched successfully'));
});
