
import express from 'express';
import {
    generateProductQRCode,
    downloadProductQRCode,
    generateProductQRCodeSVG,
    generateBulkQRCodes,
    generateCustomQRCode,
} from '../controllers/qrcodeController';
import { protect, authorize } from '../middlewares/authMiddleware';

const router = express.Router();

/**
 * QR Code Routes
 * 
 * Provides QR code generation for products and custom content.
 * 
 * Use Cases:
 * - Physical product labels
 * - Marketing materials
 * - Social media sharing
 * - Packaging
 * 
 * Output Formats:
 * - Base64 PNG (for web display)
 * - Downloadable PNG (for printing)
 * - SVG (for high-quality print)
 */

// Apply protection and authorization
router.use(protect);
router.use(authorize('seller', 'admin'));

// ============================================
// Product QR Codes
// ============================================

/**
 * GET /api/v1/qrcode/product/:productId
 * Generate QR code as Base64 PNG.
 * 
 * Response: { qrCode: "data:image/png;base64,..." }
 */
router.get('/product/:productId', generateProductQRCode);

/**
 * GET /api/v1/qrcode/product/:productId/download
 * Download QR code as PNG file.
 * 
 * Response: Binary PNG file
 */
router.get('/product/:productId/download', downloadProductQRCode);

/**
 * GET /api/v1/qrcode/product/:productId/svg
 * Generate QR code as SVG (scalable vector).
 * 
 * Response: { qrCodeSvg: "<svg>...</svg>" }
 */
router.get('/product/:productId/svg', generateProductQRCodeSVG);

// ============================================
// Bulk QR Codes
// ============================================

/**
 * POST /api/v1/qrcode/products/bulk
 * Generate QR codes for multiple products.
 * 
 * Body: { productIds: ["id1", "id2", ...] }
 * Max: 20 products per request
 * 
 * Response: { qrCodes: [{ productId, productName, qrCode }, ...] }
 */
router.post('/products/bulk', generateBulkQRCodes);

// ============================================
// Custom QR Codes
// ============================================

/**
 * POST /api/v1/qrcode/custom
 * Generate QR code for custom URL or text.
 * 
 * Body: { content: "https://...", size?: 300 }
 * 
 * Use Cases:
 * - Store page link
 * - Social media profile
 * - Custom promotion URL
 */
router.post('/custom', generateCustomQRCode);

export default router;
