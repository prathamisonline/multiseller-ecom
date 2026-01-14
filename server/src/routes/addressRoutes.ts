import express from 'express';
import {
    getAddresses,
    getAddress,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
} from '../controllers/addressController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

// All routes are private
router.use(protect);

router.route('/')
    .get(getAddresses)
    .post(addAddress);

router.route('/:id')
    .get(getAddress)
    .put(updateAddress)
    .delete(deleteAddress);

router.put('/:id/default', setDefaultAddress);

export default router;
