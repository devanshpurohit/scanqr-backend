import express from 'express';
import {
    adminLogin,
    getAnalytics,
    getUsers,
    getUser,
    updateUser,
    deleteUser,
    getAllCards,
    deleteCard,
    getAdmins,
    createAdmin,
    updateAdminPermissions,
    deleteAdmin
} from '../controllers/admin.controller.js';
import { protectAdmin, checkPermission, requireSuperAdmin } from '../middlewares/admin.middleware.js';

const router = express.Router();

// Public route
router.post('/login', adminLogin);

// Protected admin routes
router.use(protectAdmin);

// Analytics
router.get('/analytics', checkPermission('analytics', 'view'), getAnalytics);

// User management
router.get('/users', checkPermission('users', 'view'), getUsers);
router.get('/users/:id', checkPermission('users', 'view'), getUser);
router.put('/users/:id', checkPermission('users', 'edit'), updateUser);
router.delete('/users/:id', checkPermission('users', 'delete'), deleteUser);

// Card management
router.get('/cards', checkPermission('cards', 'view'), getAllCards);
router.delete('/cards/:id', checkPermission('cards', 'delete'), deleteCard);

// Admin management (Super Admin only)
router.get('/admins', requireSuperAdmin, getAdmins);
router.post('/admins', requireSuperAdmin, createAdmin);
router.put('/admins/:id', requireSuperAdmin, updateAdminPermissions);
router.delete('/admins/:id', requireSuperAdmin, deleteAdmin);

export default router;
