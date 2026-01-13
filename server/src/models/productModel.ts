
import mongoose, { Schema, Document } from 'mongoose';

/**
 * Interface for Product Document
 * 
 * Products are created by sellers and require admin approval before being visible
 * to customers on the storefront.
 */
export interface IProduct extends Document {
    seller: mongoose.Types.ObjectId; // Reference to the User who owns this product
    name: string;
    slug: string; // URL-friendly version of product name
    description: string;
    price: number; // Selling price
    mrp: number; // Maximum Retail Price (for showing discounts)
    stock: number; // Available inventory
    category: string; // Product category (can be enhanced to ObjectId ref later)
    images: string[]; // Array of image URLs
    status: 'pending' | 'approved' | 'rejected';
    adminRemarks?: string; // Reason for rejection
    archived: boolean; // Soft delete flag
    attributes: { key: string; value: string }[]; // Dynamic attributes (e.g., Color: Red, Size: M)
    createdAt: Date;
    updatedAt: Date;
}

const ProductSchema: Schema = new Schema(
    {
        seller: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true, // Index for fast lookup by seller
        },
        name: {
            type: String,
            required: [true, 'Please add a product name'],
            trim: true,
            maxlength: [200, 'Product name cannot exceed 200 characters'],
        },
        slug: {
            type: String,
            lowercase: true,
            index: true,
        },
        description: {
            type: String,
            required: [true, 'Please add a product description'],
            maxlength: [2000, 'Description cannot exceed 2000 characters'],
        },
        price: {
            type: Number,
            required: [true, 'Please add selling price'],
            min: [0, 'Price cannot be negative'],
        },
        mrp: {
            type: Number,
            required: [true, 'Please add MRP'],
            min: [0, 'MRP cannot be negative'],
        },
        stock: {
            type: Number,
            required: [true, 'Please add stock quantity'],
            min: [0, 'Stock cannot be negative'],
            default: 0,
        },
        category: {
            type: String,
            required: [true, 'Please add a category'],
            trim: true,
            // Can be enhanced to use a separate Category model with ObjectId reference
        },
        images: {
            type: [String],
            validate: {
                validator: function (v: string[]) {
                    return v.length <= 10; // Maximum 10 images per product
                },
                message: 'A product can have a maximum of 10 images',
            },
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending', // All new products require admin approval
        },
        adminRemarks: {
            type: String,
        },
        archived: {
            type: Boolean,
            default: false, // Used for soft delete (sellers can "delete" without removing data)
        },
        attributes: [
            {
                key: {
                    type: String,
                    trim: true,
                },
                value: {
                    type: String,
                    trim: true,
                },
            },
        ],
    },
    {
        timestamps: true, // Automatically manage createdAt and updatedAt
    }
);

/**
 * Compound index for efficient queries:
 * - Find products by seller
 * - Filter by status
 * - Exclude archived products
 */
ProductSchema.index({ seller: 1, status: 1, archived: 1 });

/**
 * Middleware: Generate slug from product name before saving.
 * Appends a random suffix to ensure uniqueness.
 */
ProductSchema.pre<IProduct>('save', function () {
    if (this.isModified('name')) {
        // Create slug: lowercase, replace spaces with hyphens, remove special chars
        const baseSlug = this.name
            .toLowerCase()
            .split(' ')
            .join('-')
            .replace(/[^\w-]+/g, '');
        // Append short random suffix for uniqueness (production may use nanoid or uuid)
        const suffix = Math.random().toString(36).substring(2, 8);
        this.slug = `${baseSlug}-${suffix}`;
    }
});

/**
 * Middleware: Validate that price <= mrp
 * MRP (Maximum Retail Price) should always be >= selling price.
 */
ProductSchema.pre<IProduct>('save', function () {
    if (this.price > this.mrp) {
        throw new Error('Selling price cannot be greater than MRP');
    }
});

export default mongoose.model<IProduct>('Product', ProductSchema);
