
import { Request, Response, NextFunction } from 'express';
import Cart from '../models/cartModel';
import Product from '../models/productModel';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import { ApiResponse } from '../utils/ApiResponse';

/**
 * @desc    Get current user's cart
 * @route   GET /api/v1/cart
 * @access  Private
 * 
 * Returns the user's cart with all items.
 * If no cart exists, returns an empty cart structure.
 */
export const getCart = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    let cart = await Cart.findOne({ user: req.user!._id });

    // If no cart exists, return empty cart structure
    if (!cart) {
        return res.status(200).json(
            new ApiResponse(200, { items: [], totalItems: 0, totalPrice: 0 }, 'Cart is empty')
        );
    }

    res.status(200).json(
        new ApiResponse(200, cart, 'Cart fetched successfully')
    );
});

/**
 * @desc    Add item to cart
 * @route   POST /api/v1/cart/items
 * @body    { productId: string, quantity?: number }
 * @access  Private
 * 
 * Adds a product to the cart. If product already exists in cart,
 * increments the quantity instead of adding a duplicate.
 * 
 * Validations:
 * - Product must exist and be approved
 * - Product must have sufficient stock
 * - Quantity must be at least 1
 */
export const addToCart = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { productId, quantity = 1 } = req.body;

    // 1. Validate input
    if (!productId) {
        return next(new AppError('Product ID is required', 400));
    }

    if (quantity < 1) {
        return next(new AppError('Quantity must be at least 1', 400));
    }

    // 2. Find the product and validate it's purchasable
    const product = await Product.findOne({
        _id: productId,
        status: 'approved',
        archived: false,
    });

    if (!product) {
        return next(new AppError('Product not found or not available', 404));
    }

    // 3. Check stock availability
    if (product.stock < quantity) {
        return next(new AppError(`Only ${product.stock} items available in stock`, 400));
    }

    // 4. Find or create cart for user
    let cart = await Cart.findOne({ user: req.user!._id });

    if (!cart) {
        // Create new cart
        cart = new Cart({
            user: req.user!._id,
            items: [],
        });
    }

    // 5. Check if product already in cart
    const existingItemIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
        // Product exists in cart - update quantity
        const newQuantity = cart.items[existingItemIndex].quantity + quantity;

        // Validate total quantity against stock
        if (newQuantity > product.stock) {
            return next(
                new AppError(
                    `Cannot add ${quantity} more. Only ${product.stock - cart.items[existingItemIndex].quantity} more available`,
                    400
                )
            );
        }

        cart.items[existingItemIndex].quantity = newQuantity;
    } else {
        // Add new item to cart with product snapshot
        cart.items.push({
            product: product._id as any,
            name: product.name,
            price: product.price,
            image: product.images[0] || '',
            quantity,
            seller: product.seller,
        });
    }

    // 6. Save cart (totals are auto-calculated in pre-save hook)
    await cart.save();

    res.status(200).json(
        new ApiResponse(200, cart, 'Item added to cart successfully')
    );
});

/**
 * @desc    Update item quantity in cart
 * @route   PUT /api/v1/cart/items/:productId
 * @body    { quantity: number }
 * @access  Private
 * 
 * Updates the quantity of a specific item in the cart.
 * If quantity is set to 0, the item is removed.
 */
export const updateCartItem = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { productId } = req.params;
    const { quantity } = req.body;

    // 1. Validate quantity
    if (quantity === undefined || quantity < 0) {
        return next(new AppError('Valid quantity is required', 400));
    }

    // 2. Find user's cart
    const cart = await Cart.findOne({ user: req.user!._id });

    if (!cart) {
        return next(new AppError('Cart not found', 404));
    }

    // 3. Find item in cart
    const itemIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
        return next(new AppError('Item not found in cart', 404));
    }

    // 4. Handle quantity = 0 (remove item)
    if (quantity === 0) {
        cart.items.splice(itemIndex, 1);
        await cart.save();
        return res.status(200).json(
            new ApiResponse(200, cart, 'Item removed from cart')
        );
    }

    // 5. Validate stock for new quantity
    const product = await Product.findById(productId);

    if (!product) {
        // Product was deleted - remove from cart
        cart.items.splice(itemIndex, 1);
        await cart.save();
        return next(new AppError('Product no longer available', 404));
    }

    if (quantity > product.stock) {
        return next(new AppError(`Only ${product.stock} items available in stock`, 400));
    }

    // 6. Update quantity
    cart.items[itemIndex].quantity = quantity;
    // Also update price in case it changed (optional, depends on business logic)
    cart.items[itemIndex].price = product.price;

    await cart.save();

    res.status(200).json(
        new ApiResponse(200, cart, 'Cart updated successfully')
    );
});

/**
 * @desc    Remove item from cart
 * @route   DELETE /api/v1/cart/items/:productId
 * @access  Private
 * 
 * Removes a specific item from the cart entirely.
 */
export const removeFromCart = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { productId } = req.params;

    // 1. Find user's cart
    const cart = await Cart.findOne({ user: req.user!._id });

    if (!cart) {
        return next(new AppError('Cart not found', 404));
    }

    // 2. Find and remove item
    const itemIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
        return next(new AppError('Item not found in cart', 404));
    }

    cart.items.splice(itemIndex, 1);
    await cart.save();

    res.status(200).json(
        new ApiResponse(200, cart, 'Item removed from cart')
    );
});

/**
 * @desc    Clear entire cart
 * @route   DELETE /api/v1/cart
 * @access  Private
 * 
 * Removes all items from the cart.
 */
export const clearCart = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const cart = await Cart.findOne({ user: req.user!._id });

    if (!cart) {
        return res.status(200).json(
            new ApiResponse(200, { items: [], totalItems: 0, totalPrice: 0 }, 'Cart is already empty')
        );
    }

    cart.items = [];
    await cart.save();

    res.status(200).json(
        new ApiResponse(200, cart, 'Cart cleared successfully')
    );
});

/**
 * @desc    Validate cart before checkout
 * @route   POST /api/v1/cart/validate
 * @access  Private
 * 
 * Checks all items in cart for:
 * - Product availability (still exists and is approved)
 * - Stock availability
 * - Price changes
 * 
 * Returns updated cart with any invalid items flagged/removed.
 * This is called before initiating payment.
 */
export const validateCart = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const cart = await Cart.findOne({ user: req.user!._id });

    if (!cart || cart.items.length === 0) {
        return next(new AppError('Cart is empty', 400));
    }

    const validationResults: {
        valid: boolean;
        removedItems: string[];
        updatedItems: string[];
        priceChanges: { product: string; oldPrice: number; newPrice: number }[];
    } = {
        valid: true,
        removedItems: [],
        updatedItems: [],
        priceChanges: [],
    };

    // Check each item
    for (let i = cart.items.length - 1; i >= 0; i--) {
        const item = cart.items[i];
        const product = await Product.findOne({
            _id: item.product,
            status: 'approved',
            archived: false,
        });

        if (!product) {
            // Product no longer available - remove from cart
            validationResults.removedItems.push(item.name);
            cart.items.splice(i, 1);
            validationResults.valid = false;
            continue;
        }

        // Check stock
        if (product.stock < item.quantity) {
            if (product.stock === 0) {
                // Out of stock - remove
                validationResults.removedItems.push(item.name);
                cart.items.splice(i, 1);
            } else {
                // Reduce quantity to available stock
                validationResults.updatedItems.push(
                    `${item.name}: quantity reduced from ${item.quantity} to ${product.stock}`
                );
                cart.items[i].quantity = product.stock;
            }
            validationResults.valid = false;
        }

        // Check price changes
        if (product.price !== item.price) {
            validationResults.priceChanges.push({
                product: item.name,
                oldPrice: item.price,
                newPrice: product.price,
            });
            cart.items[i].price = product.price;
        }
    }

    await cart.save();

    res.status(200).json(
        new ApiResponse(
            200,
            {
                cart,
                validation: validationResults,
            },
            validationResults.valid
                ? 'Cart is valid and ready for checkout'
                : 'Cart has been updated. Please review changes before checkout.'
        )
    );
});
