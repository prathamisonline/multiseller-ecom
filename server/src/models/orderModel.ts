
import mongoose, { Schema, Document } from 'mongoose';

/**
 * Interface for Order Item
 * 
 * Stores a snapshot of product data at the time of purchase.
 * This is critical for historical accuracy - prices, names may change,
 * but order records must reflect what was actually purchased.
 */
export interface IOrderItem {
    product: mongoose.Types.ObjectId;
    seller: mongoose.Types.ObjectId;
    name: string; // Snapshot
    price: number; // Snapshot - price at time of purchase
    image: string; // Snapshot
    quantity: number;
    itemTotal: number; // price * quantity
}

/**
 * Interface for Shipping Address
 * 
 * Embedded document to store delivery address.
 * Stored as a snapshot so address changes don't affect past orders.
 */
export interface IShippingAddress {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
}

/**
 * Interface for Payment Info
 * 
 * Stores Razorpay payment details after successful payment.
 */
export interface IPaymentInfo {
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
    method?: string; // card, upi, netbanking, etc.
    status: 'pending' | 'paid' | 'failed' | 'refunded';
    paidAt?: Date;
}

/**
 * Order Status Flow:
 * 
 * created     -> Order placed, awaiting payment
 * paid        -> Payment received
 * processing  -> Seller is preparing the order
 * shipped     -> Order has been dispatched
 * delivered   -> Order delivered to customer
 * cancelled   -> Order cancelled (before shipping)
 * refunded    -> Payment refunded
 */
export type OrderStatus =
    | 'created'
    | 'paid'
    | 'processing'
    | 'shipped'
    | 'delivered'
    | 'cancelled'
    | 'refunded';

/**
 * Interface for Order Document
 */
export interface IOrder extends Document {
    orderNumber: string; // Human-readable order ID (e.g., ORD-1234567890)
    user?: mongoose.Types.ObjectId; // Optional for guest checkout
    guestInfo?: {
        email: string;
        phone: string;
        name: string;
    };
    items: IOrderItem[];
    shippingAddress: IShippingAddress;
    itemsTotal: number; // Sum of all item prices
    shippingCost: number; // Shipping charges
    taxAmount: number; // Tax amount
    totalAmount: number; // Grand total (items + shipping + tax)
    paymentInfo: IPaymentInfo;
    status: OrderStatus;
    statusHistory: {
        status: OrderStatus;
        timestamp: Date;
        note?: string;
    }[];
    notes?: string; // Customer notes for the order
    createdAt: Date;
    updatedAt: Date;
}

// ============================================
// SUB-SCHEMAS
// ============================================

const OrderItemSchema = new Schema(
    {
        product: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        seller: {
            type: Schema.Types.ObjectId,
            ref: 'User',
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
            min: 1,
        },
        itemTotal: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    { _id: false }
);

const ShippingAddressSchema = new Schema(
    {
        fullName: {
            type: String,
            required: [true, 'Full name is required'],
        },
        phone: {
            type: String,
            required: [true, 'Phone number is required'],
        },
        addressLine1: {
            type: String,
            required: [true, 'Address is required'],
        },
        addressLine2: {
            type: String,
        },
        city: {
            type: String,
            required: [true, 'City is required'],
        },
        state: {
            type: String,
            required: [true, 'State is required'],
        },
        postalCode: {
            type: String,
            required: [true, 'Postal code is required'],
        },
        country: {
            type: String,
            required: [true, 'Country is required'],
            default: 'India',
        },
    },
    { _id: false }
);

const PaymentInfoSchema = new Schema(
    {
        razorpayOrderId: String,
        razorpayPaymentId: String,
        razorpaySignature: String,
        method: String,
        status: {
            type: String,
            enum: ['pending', 'paid', 'failed', 'refunded'],
            default: 'pending',
        },
        paidAt: Date,
    },
    { _id: false }
);

const StatusHistorySchema = new Schema(
    {
        status: {
            type: String,
            required: true,
        },
        timestamp: {
            type: Date,
            default: Date.now,
        },
        note: String,
    },
    { _id: false }
);

// ============================================
// MAIN ORDER SCHEMA
// ============================================

const OrderSchema: Schema = new Schema(
    {
        orderNumber: {
            type: String,
            unique: true,
            required: true,
            index: true,
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            index: true,
            // Not required - allows guest checkout
        },
        guestInfo: {
            email: String,
            phone: String,
            name: String,
        },
        items: {
            type: [OrderItemSchema],
            required: true,
            validate: {
                validator: function (v: IOrderItem[]) {
                    return v.length > 0;
                },
                message: 'Order must have at least one item',
            },
        },
        shippingAddress: {
            type: ShippingAddressSchema,
            required: true,
        },
        itemsTotal: {
            type: Number,
            required: true,
            min: 0,
        },
        shippingCost: {
            type: Number,
            default: 0,
            min: 0,
        },
        taxAmount: {
            type: Number,
            default: 0,
            min: 0,
        },
        totalAmount: {
            type: Number,
            required: true,
            min: 0,
        },
        paymentInfo: {
            type: PaymentInfoSchema,
            default: () => ({ status: 'pending' }),
        },
        status: {
            type: String,
            enum: ['created', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
            default: 'created',
            index: true,
        },
        statusHistory: {
            type: [StatusHistorySchema],
            default: [],
        },
        notes: String,
    },
    {
        timestamps: true,
    }
);

// ============================================
// INDEXES
// ============================================

// Compound index for seller order queries
// Allows efficient queries like: "Show all orders containing my products"
OrderSchema.index({ 'items.seller': 1, status: 1 });

// Index for user order history
OrderSchema.index({ user: 1, createdAt: -1 });

// ============================================
// STATICS
// ============================================

/**
 * Generate unique order number
 * Format: ORD-{timestamp}{random}
 */
OrderSchema.statics.generateOrderNumber = function (): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ORD-${timestamp}${random}`;
};

// ============================================
// MIDDLEWARE
// ============================================

/**
 * Pre-save: Initialize status history on create
 */
OrderSchema.pre<IOrder>('save', function () {
    if (this.isNew) {
        this.statusHistory.push({
            status: this.status,
            timestamp: new Date(),
            note: 'Order created',
        });
    }
});

// Extend the model interface to include statics
interface IOrderModel extends mongoose.Model<IOrder> {
    generateOrderNumber(): string;
}

export default mongoose.model<IOrder, IOrderModel>('Order', OrderSchema);
