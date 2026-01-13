
import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export interface IUser extends Document {
    name: string;
    email: string;
    password?: string;
    role: 'user' | 'admin';
    createdAt: Date;
    matchPassword: (enteredPassword: string) => Promise<boolean>;
    getSignedJwtToken: () => string;
}

const UserSchema: Schema = new Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a name'],
        },
        email: {
            type: String,
            required: [true, 'Please add an email'],
            unique: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'Please add a valid email',
            ],
        },
        password: {
            type: String,
            required: [true, 'Please add a password'],
            minlength: 6,
            select: false,
        },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user',
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

// Encrypt password using bcrypt
UserSchema.pre<IUser>('save', async function () {
    if (!this.isModified('password')) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password as string, salt);
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword: string): Promise<boolean> {
    return await bcrypt.compare(enteredPassword, this.password as string);
};

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function (): string {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET as string, {
        expiresIn: process.env.JWT_EXPIRE as jwt.SignOptions['expiresIn'],
    });
};

export default mongoose.model<IUser>('User', UserSchema);
