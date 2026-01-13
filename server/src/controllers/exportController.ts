
import { Request, Response, NextFunction } from 'express';
import ExcelJS from 'exceljs';
import Order from '../models/orderModel';
import Product from '../models/productModel';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';

/**
 * Export Controller
 * 
 * Handles exporting data (Orders, Products) to Excel format (.xlsx)
 * using the ExcelJS library.
 */

// ============================================
// ORDER EXPORTS
// ============================================

/**
 * @desc    Export all orders to Excel (Admin)
 * @route   GET /api/v1/exports/admin/orders
 * @access  Private/Admin
 */
export const exportOrdersAdmin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // 1. Fetch Orders
    const orders = await Order.find()
        .populate('user', 'name email')
        .sort({ createdAt: -1 });

    // 2. Create Workbook and Worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Orders');

    // 3. Define Columns
    worksheet.columns = [
        { header: 'Order Number', key: 'orderNumber', width: 20 },
        { header: 'Order Date', key: 'createdAt', width: 20 },
        { header: 'Customer Name', key: 'customerName', width: 25 },
        { header: 'Customer Email', key: 'customerEmail', width: 25 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Total Amount', key: 'totalAmount', width: 15 },
        { header: 'Payment Status', key: 'paymentStatus', width: 15 },
        { header: 'Items Count', key: 'itemsCount', width: 12 },
        { header: 'Shipping City', key: 'city', width: 15 },
    ];

    // 4. Add Rows
    orders.forEach((order) => {
        worksheet.addRow({
            orderNumber: order.orderNumber,
            createdAt: order.createdAt.toLocaleString(),
            customerName: order.user ? (order.user as any).name : (order.guestInfo?.name || 'Guest'),
            customerEmail: order.user ? (order.user as any).email : (order.guestInfo?.email || 'N/A'),
            status: order.status.toUpperCase(),
            totalAmount: order.totalAmount,
            paymentStatus: order.paymentInfo.status.toUpperCase(),
            itemsCount: order.items.length,
            city: order.shippingAddress.city,
        });
    });

    // 5. Styling Header
    worksheet.getRow(1).font = { bold: true };

    // 6. Set response headers for file download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=all-orders.xlsx');

    // 7. Write to Buffer and Send
    const buffer = await workbook.xlsx.writeBuffer();
    res.send(buffer);
});

/**
 * @desc    Export seller's orders to Excel
 * @route   GET /api/v1/exports/seller/orders
 * @access  Private/Seller
 */
export const exportOrdersSeller = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const sellerId = req.user!._id;

    // 1. Fetch Orders containing seller's products
    const orders = await Order.find({ 'items.seller': sellerId })
        .sort({ createdAt: -1 });

    // 2. Create Workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('My Orders');

    // 3. Define Columns
    worksheet.columns = [
        { header: 'Order Number', key: 'orderNumber', width: 20 },
        { header: 'Date', key: 'createdAt', width: 20 },
        { header: 'My Products', key: 'products', width: 40 },
        { header: 'My Revenue', key: 'revenue', width: 15 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Customer Name', key: 'customerName', width: 25 },
    ];

    // 4. Add Rows
    orders.forEach((order) => {
        // Filter items to only show seller's products in the export
        const sellerItems = order.items.filter(item => item.seller.toString() === sellerId.toString());
        const productNames = sellerItems.map(item => `${item.name} (x${item.quantity})`).join(', ');
        const sellerRevenue = sellerItems.reduce((sum, item) => sum + item.itemTotal, 0);

        worksheet.addRow({
            orderNumber: order.orderNumber,
            createdAt: order.createdAt.toLocaleString(),
            products: productNames,
            revenue: sellerRevenue,
            status: order.status.toUpperCase(),
            customerName: order.user ? 'User' : (order.guestInfo?.name || 'Guest'), // Privacy: mask full name if needed
        });
    });

    // 5. Styling
    worksheet.getRow(1).font = { bold: true };

    // 6. Response
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=seller-orders-${sellerId}.xlsx`);

    const buffer = await workbook.xlsx.writeBuffer();
    res.send(buffer);
});

// ============================================
// PRODUCT EXPORTS
// ============================================

/**
 * @desc    Export all products to Excel (Admin)
 */
export const exportProductsAdmin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const products = await Product.find({ archived: false }).populate('seller', 'name email').sort({ name: 1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Products');

    worksheet.columns = [
        { header: 'Name', key: 'name', width: 30 },
        { header: 'Slug', key: 'slug', width: 25 },
        { header: 'Category', key: 'category', width: 20 },
        { header: 'Price (INR)', key: 'price', width: 12 },
        { header: 'MRP (INR)', key: 'mrp', width: 12 },
        { header: 'Stock', key: 'stock', width: 10 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Seller Name', key: 'sellerName', width: 25 },
        { header: 'Created At', key: 'createdAt', width: 20 },
    ];

    products.forEach(p => {
        worksheet.addRow({
            name: p.name,
            slug: p.slug,
            category: p.category,
            price: p.price,
            mrp: p.mrp,
            stock: p.stock,
            status: p.status.toUpperCase(),
            sellerName: (p.seller as any).name || 'N/A',
            createdAt: p.createdAt.toLocaleString(),
        });
    });

    worksheet.getRow(1).font = { bold: true };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=all-products.xlsx');

    const buffer = await workbook.xlsx.writeBuffer();
    res.send(buffer);
});

/**
 * @desc    Export seller's products to Excel
 */
export const exportProductsSeller = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const sellerId = req.user!._id;
    const products = await Product.find({ seller: sellerId, archived: false }).sort({ name: 1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('My Products');

    worksheet.columns = [
        { header: 'Name', key: 'name', width: 30 },
        { header: 'Category', key: 'category', width: 20 },
        { header: 'Price (INR)', key: 'price', width: 12 },
        { header: 'MRP (INR)', key: 'mrp', width: 12 },
        { header: 'Stock', key: 'stock', width: 10 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Created At', key: 'createdAt', width: 20 },
    ];

    products.forEach(p => {
        worksheet.addRow({
            name: p.name,
            category: p.category,
            price: p.price,
            mrp: p.mrp,
            stock: p.stock,
            status: p.status.toUpperCase(),
            createdAt: p.createdAt.toLocaleString(),
        });
    });

    worksheet.getRow(1).font = { bold: true };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=my-products.xlsx`);

    const buffer = await workbook.xlsx.writeBuffer();
    res.send(buffer);
});
