import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/userModel';

dotenv.config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URL as string);
        console.log('MongoDB Connected...');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: 'admin@shoplivedeals.com' });

        if (existingAdmin) {
            console.log('Admin user already exists!');
            console.log('Email: admin@shoplivedeals.com');
            console.log('Password: admin123');
            process.exit(0);
        }

        // Create admin user
        const adminUser = await User.create({
            name: 'Admin User',
            email: 'admin@shoplivedeals.com',
            password: 'admin123',
            role: 'admin',
            isActive: true
        });

        console.log('✅ Admin user created successfully!');
        console.log('----------------------------------');
        console.log('Email: admin@shoplivedeals.com');
        console.log('Password: admin123');
        console.log('----------------------------------');
        console.log('⚠️  Please change the password after first login!');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

createAdmin();
