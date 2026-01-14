
import mongoose, { Schema, Document } from 'mongoose';

// Interface for Seller Document
export interface ISeller extends Document {
    user: mongoose.Types.ObjectId;
    storeName: string;
    slug: string; // URL-friendly version of storeName
    description?: string;
    logoUrl?: string; // URL to the store logo image
    businessDetails: {
        gstNumber?: string; // GST Identification Number
        pan: string; // Permanent Account Number
        address: string;
    };
    bankDetails?: {
        accountNumber: string;
        ifscCode: string;
        bankName: string;
        accountId?: string; // Razorpay Linked Account ID
    };
    commissionRate: number;
    status: 'pending' | 'approved' | 'rejected' | 'suspended';
    adminRemarks?: string; // Reason for rejection or suspension
    createdAt: Date;
    updatedAt: Date;
}

// Validation for simple unique check is insufficient for race conditions, 
// but Mongoose 'unique: true' indexes handle it at DB level.

const SellerSchema: Schema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true, // One seller profile per user
        },
        storeName: {
            type: String,
            required: [true, 'Please add a store name'],
            unique: true, // Store names must be unique across the platform
            trim: true,
            minlength: [3, 'Store name must be at least 3 characters'],
        },
        slug: {
            type: String,
            unique: true,
            lowercase: true,
            index: true, // Index for faster lookups by slug
        },
        description: {
            type: String,
            maxlength: [500, 'Description cannot be more than 500 characters'],
        },
        logoUrl: {
            type: String,
        },
        businessDetails: {
            gstNumber: {
                type: String,
                trim: true,
            },
            pan: {
                type: String,
                required: [true, 'Please provide PAN number'],
                trim: true,
                uppercase: true,
            },
            address: {
                type: String,
                required: [true, 'Please provide business address'],
            },
        },
        bankDetails: {
            accountNumber: String,
            ifscCode: String,
            bankName: String,
            accountId: String,
        },
        commissionRate: {
            type: Number,
            default: 5, // Default 5% platform fee
            min: 0,
            max: 100,
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected', 'suspended'],
            default: 'pending', // Default status is pending admin approval
        },
        adminRemarks: {
            type: String,
        },
    },
    {
        timestamps: true, // Automatically manage createdAt and updatedAt
    }
);

// Middleware to create slug from storeName before saving
SellerSchema.pre<ISeller>('save', function () {
    if (this.isModified('storeName')) {
        // Simple slugify: lowercase, replace spaces with hyphens, remove non-alphanumeric chars
        this.slug = this.storeName
            .toLowerCase()
            .split(' ')
            .join('-')
            .replace(/[^\w-]+/g, '');
    }
});

export default mongoose.model<ISeller>('Seller', SellerSchema);
