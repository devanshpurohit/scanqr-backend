import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.model.js';

export const protectAdmin = async (req, res, next) => {
    try {
        let token;

        // Check for token in Authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies.adminToken) {
            token = req.cookies.adminToken;
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route'
            });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get admin from token
            req.admin = await Admin.findById(decoded.id).select('-password');

            if (!req.admin) {
                return res.status(401).json({
                    success: false,
                    message: 'Admin not found'
                });
            }

            if (!req.admin.isActive) {
                return res.status(401).json({
                    success: false,
                    message: 'Admin account is deactivated'
                });
            }

            next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Token is invalid or expired'
            });
        }
    } catch (error) {
        next(error);
    }
};

// Check if admin has specific permission
export const checkPermission = (resource, action) => {
    return (req, res, next) => {
        if (req.admin.role === 'superadmin') {
            return next(); // Super admin has all permissions
        }

        if (!req.admin.permissions[resource] || !req.admin.permissions[resource][action]) {
            return res.status(403).json({
                success: false,
                message: `You don't have permission to ${action} ${resource}`
            });
        }

        next();
    };
};

// Require super admin role
export const requireSuperAdmin = (req, res, next) => {
    if (req.admin.role !== 'superadmin') {
        return res.status(403).json({
            success: false,
            message: 'Only super admins can perform this action'
        });
    }
    next();
};
