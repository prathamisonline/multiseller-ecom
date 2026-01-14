import mongoose, { Schema, Document } from 'mongoose';

export interface IAddress extends Document {
    user: mongoose.Types.ObjectId;
    fullName: string;
    phone: string;
    alternatePhone?: string;
    addressLine: string;
    landmark?: string;
    city: string;
    state: string;
    postalCode: string;
    addressType: 'home' | 'work' | 'other';
    isDefault: boolean;
    createdAt: Date;
}

const AddressSchema: Schema = new Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        fullName: {
            type: String,
            required: [true, 'Please add a full name'],
        },
        phone: {
            type: String,
            required: [true, 'Please add a phone number'],
            match: [/^[6-9]\d{9}$/, 'Please add a valid 10-digit phone number'],
        },
        alternatePhone: {
            type: String,
        },
        addressLine: {
            type: String,
            required: [true, 'Please add address details'],
        },
        landmark: {
            type: String,
        },
        city: {
            type: String,
            required: [true, 'Please add a city'],
        },
        state: {
            type: String,
            required: [true, 'Please add a state'],
        },
        postalCode: {
            type: String,
            required: [true, 'Please add a postal code'],
            match: [/^\d{6}$/, 'Please add a valid 6-digit postal code'],
        },
        addressType: {
            type: String,
            enum: ['home', 'work', 'other'],
            default: 'home',
        },
        isDefault: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Before saving, if isDefault is true, set all other addresses for this user to isDefault: false
AddressSchema.pre<IAddress>('save', async function () {
    if (this.isDefault) {
        await mongoose.model('Address').updateMany(
            { user: this.user, _id: { $ne: this._id } },
            { isDefault: false }
        );
    }
});

export default mongoose.model<IAddress>('Address', AddressSchema);
