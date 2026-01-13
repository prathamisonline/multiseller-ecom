
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import User, { IUser } from '../models/userModel';

interface JwtPayload {
    id: string;
}

export const protect = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        // Set token from Bearer token in header
        token = req.headers.authorization.split(' ')[1];
    }

    // Make sure token exists
    if (!token) {
        return next(new AppError('Not authorized to access this route', 401));
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

        const user = await User.findById(decoded.id);

        if (!user) {
            return next(new AppError('No user found with this id', 404));
        }

        req.user = user;

        next();
    } catch (err) {
        return next(new AppError('Not authorized to access this route', 401));
    }
});

// Grant access to specific roles
export const authorize = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return next(
                new AppError(`User role ${req.user?.role} is not authorized to access this route`, 403)
            );
        }
        next();
    };
};
