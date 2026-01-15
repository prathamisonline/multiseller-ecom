
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

// Handle MongoDB duplicate key error
const handleDuplicateKeyError = (err: any): AppError => {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    const message = `${field.charAt(0).toUpperCase() + field.slice(1)} '${value}' already exists. Please use a different ${field}.`;
    return new AppError(message, 400);
};

// Handle MongoDB validation error
const handleValidationError = (err: any): AppError => {
    const errors = Object.values(err.errors).map((el: any) => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
};

// Handle MongoDB cast error
const handleCastError = (err: any): AppError => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400);
};

const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
    let error = { ...err };
    error.message = err.message;
    error.statusCode = err.statusCode || 500;
    error.status = err.status || 'error';

    // Log to console for dev
    console.error('ERROR 💥', err);

    // Handle specific MongoDB errors
    if (err.code === 11000) {
        error = handleDuplicateKeyError(err);
    }
    if (err.name === 'ValidationError') {
        error = handleValidationError(err);
    }
    if (err.name === 'CastError') {
        error = handleCastError(err);
    }

    if (process.env.NODE_ENV === 'development') {
        res.status(error.statusCode).json({
            status: error.status,
            error: err,
            message: error.message,
            stack: err.stack,
        });
    } else {
        // Production
        if (error.isOperational) {
            res.status(error.statusCode).json({
                status: error.status,
                message: error.message,
            });
        } else {
            // Programming or other unknown error: don't leak error details
            res.status(500).json({
                status: 'error',
                message: 'Something went very wrong!',
            });
        }
    }
};

export default errorMiddleware;
