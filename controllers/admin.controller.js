import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.model.js';
import User from '../models/User.model.js';
import BusinessCard from '../models/BusinessCard.model.js';

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

// @desc    Admin login
// @route   POST /api/admin/login
// @access  Public
export const adminLogin = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        const admin = await Admin.findOne({ email }).select('+password');
        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        if (!admin.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Admin account is deactivated'
            });
        }

        // Update last login
        admin.lastLogin = new Date();
        await admin.save();

        const token = generateToken(admin._id);

        res.json({
            success: true,
            message: 'Login successful',
            token,
            admin
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get dashboard analytics
// @route   GET /api/admin/analytics
// @access  Private (Admin)
export const getAnalytics = async (req, res, next) => {
    try {
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ isActive: true });
        const totalCards = await BusinessCard.countDocuments();
        const syncedCards = await BusinessCard.countDocuments({ isGoogleSynced: true });

        // Recent activity
        const recentUsers = await User.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('name email createdAt');

        const recentCards = await BusinessCard.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('userId', 'name email');

        // Cards per day (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const cardsPerDay = await BusinessCard.aggregate([
            {
                $match: {
                    createdAt: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json({
            success: true,
            analytics: {
                users: {
                    total: totalUsers,
                    active: activeUsers,
                    inactive: totalUsers - activeUsers
                },
                cards: {
                    total: totalCards,
                    synced: syncedCards,
                    unsynced: totalCards - syncedCards,
                    syncPercentage: totalCards > 0 ? Math.round((syncedCards / totalCards) * 100) : 0
                },
                recentActivity: {
                    users: recentUsers,
                    cards: recentCards
                },
                cardsPerDay
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
export const getUsers = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, search, status } = req.query;

        const query = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        if (status === 'active') {
            query.isActive = true;
        } else if (status === 'inactive') {
            query.isActive = false;
        }

        const users = await User.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await User.countDocuments(query);

        res.json({
            success: true,
            users,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single user with their cards
// @route   GET /api/admin/users/:id
// @access  Private (Admin)
export const getUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const cards = await BusinessCard.find({ userId: user._id })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            user,
            cards
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update user status
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
export const updateUser = async (req, res, next) => {
    try {
        const { isActive } = req.body;

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (isActive !== undefined) {
            user.isActive = isActive;
        }

        await user.save();

        res.json({
            success: true,
            message: 'User updated successfully',
            user
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
export const deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Delete all user's business cards
        await BusinessCard.deleteMany({ userId: user._id });

        await user.deleteOne();

        res.json({
            success: true,
            message: 'User and all associated data deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all business cards
// @route   GET /api/admin/cards
// @access  Private (Admin)
export const getAllCards = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, search, userId } = req.query;

        const query = {};

        if (search) {
            query.$text = { $search: search };
        }

        if (userId) {
            query.userId = userId;
        }

        const cards = await BusinessCard.find(query)
            .populate('userId', 'name email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await BusinessCard.countDocuments(query);

        res.json({
            success: true,
            cards,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete business card
// @route   DELETE /api/admin/cards/:id
// @access  Private (Admin)
export const deleteCard = async (req, res, next) => {
    try {
        const card = await BusinessCard.findById(req.params.id);

        if (!card) {
            return res.status(404).json({
                success: false,
                message: 'Business card not found'
            });
        }

        await card.deleteOne();

        res.json({
            success: true,
            message: 'Business card deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all admins
// @route   GET /api/admin/admins
// @access  Private (Super Admin)
export const getAdmins = async (req, res, next) => {
    try {
        const admins = await Admin.find().sort({ createdAt: -1 });

        res.json({
            success: true,
            admins
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create new admin
// @route   POST /api/admin/admins
// @access  Private (Super Admin)
export const createAdmin = async (req, res, next) => {
    try {
        const { email, password, name, role, permissions } = req.body;

        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({
                success: false,
                message: 'Admin already exists with this email'
            });
        }

        // Hash password
        const bcrypt = await import('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Set super admin permissions if role is superadmin
        let adminPermissions = permissions || {};
        if (role === 'superadmin') {
            adminPermissions = {
                users: { view: true, create: true, edit: true, delete: true },
                cards: { view: true, edit: true, delete: true },
                admins: { view: true, create: true, edit: true, delete: true },
                analytics: { view: true }
            };
        }

        const admin = await Admin.create({
            email,
            password: hashedPassword,
            name,
            role: role || 'admin',
            permissions: adminPermissions
        });

        res.status(201).json({
            success: true,
            message: 'Admin created successfully',
            admin
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update admin permissions
// @route   PUT /api/admin/admins/:id
// @access  Private (Super Admin)
export const updateAdminPermissions = async (req, res, next) => {
    try {
        const { permissions, isActive, role, password } = req.body;

        const admin = await Admin.findById(req.params.id);

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }

        // Hash password if provided
        if (password) {
            const bcrypt = await import('bcryptjs');
            const salt = await bcrypt.genSalt(10);
            admin.password = await bcrypt.hash(password, salt);
        }

        // Set super admin permissions if role is changed to superadmin
        if (role === 'superadmin') {
            admin.permissions = {
                users: { view: true, create: true, edit: true, delete: true },
                cards: { view: true, edit: true, delete: true },
                admins: { view: true, create: true, edit: true, delete: true },
                analytics: { view: true }
            };
            admin.role = role;
        } else {
            if (permissions) admin.permissions = permissions;
            if (role) admin.role = role;
        }

        if (isActive !== undefined) admin.isActive = isActive;

        await admin.save();

        res.json({
            success: true,
            message: 'Admin updated successfully',
            admin
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete admin
// @route   DELETE /api/admin/admins/:id
// @access  Private (Super Admin)
export const deleteAdmin = async (req, res, next) => {
    try {
        const admin = await Admin.findById(req.params.id);

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }

        // Prevent deleting yourself
        if (admin._id.toString() === req.admin._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'You cannot delete your own account'
            });
        }

        await admin.deleteOne();

        res.json({
            success: true,
            message: 'Admin deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};
