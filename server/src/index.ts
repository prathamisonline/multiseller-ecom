
import express, { Application, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cors from 'cors';
import connectDB from './config/db';
import errorMiddleware from './middlewares/errorMiddleware';
import { AppError } from './utils/AppError';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Development logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

import authRoutes from './routes/authRoutes';
import sellerRoutes from './routes/sellerRoutes';
import adminRoutes from './routes/adminRoutes';
import productRoutes from './routes/productRoutes';
import storeRoutes from './routes/storeRoutes';
import cartRoutes from './routes/cartRoutes';
import orderRoutes from './routes/orderRoutes';
import paymentRoutes from './routes/paymentRoutes';
import sellerOrderRoutes from './routes/sellerOrderRoutes';
import qrcodeRoutes from './routes/qrcodeRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import exportRoutes from './routes/exportRoutes';
import shippingRoutes from './routes/shippingRoutes';
import addressRoutes from './routes/addressRoutes';

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/sellers', sellerRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/store', storeRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/seller-orders', sellerOrderRoutes);
app.use('/api/v1/qrcode', qrcodeRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/exports', exportRoutes);
app.use('/api/v1/shipping', shippingRoutes);
app.use('/api/v1/addresses', addressRoutes);

app.get('/', (req: Request, res: Response) => {
    res.send('API is running...');
});

// Handle unhandled routes
app.use((req: Request, res: Response, next: NextFunction) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handler
app.use(errorMiddleware);

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
