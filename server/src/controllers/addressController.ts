import { Request, Response, NextFunction } from 'express';
import Address from '../models/addressModel';
import { AppError } from '../utils/AppError';

/**
 * @desc    Get all addresses for logged in user
 * @route   GET /api/v1/addresses
 * @access  Private
 */
export const getAddresses = async (req: any, res: Response, next: NextFunction) => {
    try {
        const addresses = await Address.find({ user: req.user.id }).sort({ isDefault: -1, createdAt: -1 });

        res.status(200).json({
            success: true,
            count: addresses.length,
            data: addresses,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get single address
 * @route   GET /api/v1/addresses/:id
 * @access  Private
 */
export const getAddress = async (req: any, res: Response, next: NextFunction) => {
    try {
        const address = await Address.findOne({ _id: req.params.id, user: req.user.id });

        if (!address) {
            return next(new AppError('Address not found', 404));
        }

        res.status(200).json({
            success: true,
            data: address,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Add new address
 * @route   POST /api/v1/addresses
 * @access  Private
 */
export const addAddress = async (req: any, res: Response, next: NextFunction) => {
    try {
        req.body.user = req.user.id;

        // If this is the first address, make it default
        const addressCount = await Address.countDocuments({ user: req.user.id });
        if (addressCount === 0) {
            req.body.isDefault = true;
        }

        const address = await Address.create(req.body);

        res.status(201).json({
            success: true,
            data: address,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update address
 * @route   PUT /api/v1/addresses/:id
 * @access  Private
 */
export const updateAddress = async (req: any, res: Response, next: NextFunction) => {
    try {
        let address = await Address.findOne({ _id: req.params.id, user: req.user.id });

        if (!address) {
            return next(new AppError('Address not found', 404));
        }

        address = await Address.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({
            success: true,
            data: address,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete address
 * @route   DELETE /api/v1/addresses/:id
 * @access  Private
 */
export const deleteAddress = async (req: any, res: Response, next: NextFunction) => {
    try {
        const address = await Address.findOne({ _id: req.params.id, user: req.user.id });

        if (!address) {
            return next(new AppError('Address not found', 404));
        }

        // Check if we are deleting the default address
        const wasDefault = address.isDefault;

        await address.deleteOne();

        // If we deleted the default address, make the most recent one default
        if (wasDefault) {
            const nextAddress = await Address.findOne({ user: req.user.id }).sort({ createdAt: -1 });
            if (nextAddress) {
                nextAddress.isDefault = true;
                await nextAddress.save();
            }
        }

        res.status(200).json({
            success: true,
            data: {},
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Set address as default
 * @route   PUT /api/v1/addresses/:id/default
 * @access  Private
 */
export const setDefaultAddress = async (req: any, res: Response, next: NextFunction) => {
    try {
        const address = await Address.findOne({ _id: req.params.id, user: req.user.id });

        if (!address) {
            return next(new AppError('Address not found', 404));
        }

        address.isDefault = true;
        await address.save();

        res.status(200).json({
            success: true,
            data: address,
        });
    } catch (error) {
        next(error);
    }
};
