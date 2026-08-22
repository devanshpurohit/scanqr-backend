import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const createSuperAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Define admin schema inline to avoid pre-save hooks
        const adminSchema = new mongoose.Schema({
            email: String,
            password: String,
            name: String,
            role: String,
            permissions: Object,
            isActive: Boolean,
            lastLogin: Date
        }, { timestamps: true });

        const Admin = mongoose.model('Admin', adminSchema);

        // Check if super admin already exists
        const existingSuperAdmin = await Admin.findOne({ role: 'superadmin' });

        if (existingSuperAdmin) {
            console.log('⚠️  Super admin already exists');
            console.log('Email:', existingSuperAdmin.email);
            process.exit(0);
        }

        // Hash password manually
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('SuperAdmin@123', salt);

        // Create super admin
        const superAdmin = await Admin.create({
            email: 'superadmin@businesscard.com',
            password: hashedPassword,
            name: 'Super Administrator',
            role: 'superadmin',
            permissions: {
                users: { view: true, create: true, edit: true, delete: true },
                cards: { view: true, edit: true, delete: true },
                admins: { view: true, create: true, edit: true, delete: true },
                analytics: { view: true }
            },
            isActive: true
        });

        console.log('✅ Super admin created successfully!');
        console.log('Email:', superAdmin.email);
        console.log('Password: SuperAdmin@123');
        console.log('⚠️  Please change the password after first login!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

createSuperAdmin();
