
import express from 'express';
import { registerSeller, getMySellerProfile } from '../controllers/sellerController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

// Apply protection to all routes
router.use(protect);

router.post('/register', registerSeller);
router.post('/apply', registerSeller); // Alias for Postman collection
router.get('/me', getMySellerProfile);

export default router;
