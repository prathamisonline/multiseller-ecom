
import mongoose, { Schema, Document } from 'mongoose';

/**
 * Interface for Cart Item
 * 
 * Each item in the cart references a product and stores a snapshot
 * of key product details (price, name) at the time of adding.
 * This ensures price consistency even if product price changes later.
 */
export interface ICartItem {
    product: mongoose.Types.ObjectId;
    name: string; // Snapshot of product name
    price: number; // Snapshot of product price at time of adding
    image: string; // First image of product
    quantity: number;
    seller: mongoose.Types.ObjectId; // For order splitting later
}

/**
 * Interface for Cart Document
 * 
 * Server-side cart provides:
 * - Persistence across devices/sessions
 * - Easy validation against product stock
 * - Foundation for guest cart merging on login
 */
export interface ICart extends Document {
    user: mongoose.Types.ObjectId;
    items: ICartItem[];
    totalItems: number; // Total quantity of all items
    totalPrice: number; // Sum of (price * quantity) for all items
    createdAt: Date;
    updatedAt: Date;
    // Virtual methods
    calculateTotals: () => void;
}

const CartItemSchema = new Schema(
    {
        product: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        image: {
            type: String,
            default: '',
        },
        quantity: {
            type: Number,
            required: true,
            min: [1, 'Quantity cannot be less than 1'],
            default: 1,
        },
        seller: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    { _id: false } // No separate _id for subdocuments
);

const CartSchema: Schema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true, // One cart per user
            index: true,
        },
        items: [CartItemSchema],
        totalItems: {
            type: Number,
            default: 0,
        },
        totalPrice: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

/**
 * Method: Calculate totals
 * 
 * Recalculates totalItems and totalPrice based on current items.
 * Should be called after any modification to items array.
 */
CartSchema.methods.calculateTotals = function () {
    this.totalItems = this.items.reduce((sum: number, item: ICartItem) => sum + item.quantity, 0);
    this.totalPrice = this.items.reduce(
        (sum: number, item: ICartItem) => sum + item.price * item.quantity,
        0
    );
};

/**
 * Pre-save middleware: Automatically recalculate totals before saving
 */
CartSchema.pre<ICart>('save', function () {
    this.calculateTotals();
});

export default mongoose.model<ICart>('Cart', CartSchema);
