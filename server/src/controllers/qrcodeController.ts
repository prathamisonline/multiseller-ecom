
import { Request, Response, NextFunction } from 'express';
import QRCode from 'qrcode';
import Product from '../models/productModel';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import { ApiResponse } from '../utils/ApiResponse';

/**
 * QR Code Controller
 * 
 * Generates QR codes for products that can be:
 * - Displayed on physical products
 * - Used in marketing materials
 * - Shared on social media
 * - Printed on packaging
 * 
 * Each QR code contains a URL pointing to the product page.
 */

/**
 * @desc    Generate QR code for a product (as Base64 image)
 * @route   GET /api/v1/qrcode/product/:productId
 * @access  Private/Seller (Owner only)
 * 
 * Returns a Base64-encoded PNG image of the QR code.
 * This can be embedded directly in HTML: <img src="data:image/png;base64,..." />
 */
export const generateProductQRCode = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { productId } = req.params;

    // 1. Find the product
    const product = await Product.findById(productId);

    if (!product) {
        return next(new AppError('Product not found', 404));
    }

    // 2. Verify ownership (seller can only generate QR for their own products)
    if (product.seller.toString() !== req.user!._id.toString() && req.user!.role !== 'admin') {
        return next(new AppError('Not authorized to generate QR code for this product', 403));
    }

    // 3. Check if product is approved (QR codes should only be for visible products)
    if (product.status !== 'approved') {
        return next(new AppError('QR code can only be generated for approved products', 400));
    }

    // 4. Build the product URL
    // In production, replace with your actual frontend URL
    const frontendBaseUrl = process.env.FRONTEND_URL || 'https://yourstore.com';
    const productUrl = `${frontendBaseUrl}/products/${product.slug}`;

    // 5. Generate QR code as Base64 PNG
    try {
        const qrCodeDataUrl = await QRCode.toDataURL(productUrl, {
            type: 'image/png',
            width: 300, // 300x300 pixels
            margin: 2, // Quiet zone margin
            color: {
                dark: '#000000', // QR code color
                light: '#FFFFFF', // Background color
            },
            errorCorrectionLevel: 'M', // Medium error correction (15% damage recovery)
        });

        res.status(200).json(
            new ApiResponse(200, {
                productId: product._id,
                productName: product.name,
                productUrl,
                qrCode: qrCodeDataUrl, // Base64 data URL
            }, 'QR code generated successfully')
        );
    } catch (error) {
        console.error('QR code generation error:', error);
        return next(new AppError('Failed to generate QR code', 500));
    }
});

/**
 * @desc    Generate QR code as downloadable PNG image
 * @route   GET /api/v1/qrcode/product/:productId/download
 * @access  Private/Seller (Owner only)
 * 
 * Returns the QR code as a downloadable PNG file.
 */
export const downloadProductQRCode = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { productId } = req.params;

    // 1. Find the product
    const product = await Product.findById(productId);

    if (!product) {
        return next(new AppError('Product not found', 404));
    }

    // 2. Verify ownership
    if (product.seller.toString() !== req.user!._id.toString() && req.user!.role !== 'admin') {
        return next(new AppError('Not authorized to download QR code for this product', 403));
    }

    // 3. Check if product is approved
    if (product.status !== 'approved') {
        return next(new AppError('QR code can only be generated for approved products', 400));
    }

    // 4. Build the product URL
    const frontendBaseUrl = process.env.FRONTEND_URL || 'https://yourstore.com';
    const productUrl = `${frontendBaseUrl}/products/${product.slug}`;

    // 5. Generate QR code as Buffer
    try {
        const qrCodeBuffer = await QRCode.toBuffer(productUrl, {
            type: 'png',
            width: 500, // Higher resolution for download
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF',
            },
            errorCorrectionLevel: 'H', // High error correction for print (30% damage recovery)
        });

        // 6. Set headers for file download
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Disposition', `attachment; filename="qr-${product.slug}.png"`);
        res.setHeader('Content-Length', qrCodeBuffer.length);

        res.send(qrCodeBuffer);
    } catch (error) {
        console.error('QR code generation error:', error);
        return next(new AppError('Failed to generate QR code', 500));
    }
});

/**
 * @desc    Generate QR code as SVG (scalable, lossless)
 * @route   GET /api/v1/qrcode/product/:productId/svg
 * @access  Private/Seller (Owner only)
 * 
 * Returns the QR code as an SVG string.
 * Best for print materials as it scales without quality loss.
 */
export const generateProductQRCodeSVG = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { productId } = req.params;

    // 1. Find the product
    const product = await Product.findById(productId);

    if (!product) {
        return next(new AppError('Product not found', 404));
    }

    // 2. Verify ownership
    if (product.seller.toString() !== req.user!._id.toString() && req.user!.role !== 'admin') {
        return next(new AppError('Not authorized to generate QR code for this product', 403));
    }

    // 3. Check if product is approved
    if (product.status !== 'approved') {
        return next(new AppError('QR code can only be generated for approved products', 400));
    }

    // 4. Build the product URL
    const frontendBaseUrl = process.env.FRONTEND_URL || 'https://yourstore.com';
    const productUrl = `${frontendBaseUrl}/products/${product.slug}`;

    // 5. Generate QR code as SVG
    try {
        const svgString = await QRCode.toString(productUrl, {
            type: 'svg',
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF',
            },
            errorCorrectionLevel: 'M',
        });

        res.status(200).json(
            new ApiResponse(200, {
                productId: product._id,
                productName: product.name,
                productUrl,
                qrCodeSvg: svgString,
            }, 'QR code (SVG) generated successfully')
        );
    } catch (error) {
        console.error('QR code generation error:', error);
        return next(new AppError('Failed to generate QR code', 500));
    }
});

/**
 * @desc    Generate QR codes for multiple products (bulk)
 * @route   POST /api/v1/qrcode/products/bulk
 * @body    { productIds: string[] }
 * @access  Private/Seller
 * 
 * Returns QR codes for multiple products at once.
 * Limited to 20 products per request to prevent abuse.
 */
export const generateBulkQRCodes = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { productIds } = req.body;

    // 1. Validate input
    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
        return next(new AppError('Please provide an array of product IDs', 400));
    }

    // 2. Limit to 20 products
    if (productIds.length > 20) {
        return next(new AppError('Maximum 20 products per bulk request', 400));
    }

    // 3. Find products
    const products = await Product.find({
        _id: { $in: productIds },
        seller: req.user!._id,
        status: 'approved',
    });

    if (products.length === 0) {
        return next(new AppError('No valid products found', 404));
    }

    // 4. Generate QR codes for each product
    const frontendBaseUrl = process.env.FRONTEND_URL || 'https://yourstore.com';
    const qrCodes = [];

    for (const product of products) {
        const productUrl = `${frontendBaseUrl}/products/${product.slug}`;

        try {
            const qrCodeDataUrl = await QRCode.toDataURL(productUrl, {
                type: 'image/png',
                width: 300,
                margin: 2,
                errorCorrectionLevel: 'M',
            });

            qrCodes.push({
                productId: product._id,
                productName: product.name,
                productSlug: product.slug,
                productUrl,
                qrCode: qrCodeDataUrl,
            });
        } catch (error) {
            console.error(`QR code generation failed for product ${product._id}:`, error);
            // Continue with other products
            qrCodes.push({
                productId: product._id,
                productName: product.name,
                error: 'Failed to generate QR code',
            });
        }
    }

    res.status(200).json(
        new ApiResponse(200, {
            total: qrCodes.length,
            qrCodes,
        }, 'Bulk QR codes generated')
    );
});

/**
 * @desc    Generate QR code for custom URL/text
 * @route   POST /api/v1/qrcode/custom
 * @body    { content: string, size?: number }
 * @access  Private/Seller
 * 
 * Allows sellers to generate QR codes for custom URLs or text.
 * Useful for:
 * - Store pages
 * - Social media links
 * - Custom promotions
 */
export const generateCustomQRCode = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { content, size = 300 } = req.body;

    // 1. Validate input
    if (!content || typeof content !== 'string') {
        return next(new AppError('Content is required', 400));
    }

    // 2. Validate content length (QR codes have data limits)
    if (content.length > 2000) {
        return next(new AppError('Content too long. Maximum 2000 characters.', 400));
    }

    // 3. Validate size
    const qrSize = Math.min(Math.max(size, 100), 1000); // Between 100 and 1000 pixels

    // 4. Generate QR code
    try {
        const qrCodeDataUrl = await QRCode.toDataURL(content, {
            type: 'image/png',
            width: qrSize,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF',
            },
            errorCorrectionLevel: 'M',
        });

        res.status(200).json(
            new ApiResponse(200, {
                content,
                size: qrSize,
                qrCode: qrCodeDataUrl,
            }, 'Custom QR code generated successfully')
        );
    } catch (error) {
        console.error('QR code generation error:', error);
        return next(new AppError('Failed to generate QR code', 500));
    }
});
