import jwt from 'jsonwebtoken';
import { google } from 'googleapis';
import User from '../models/User.model.js';

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
    try {
        const { email, password, name } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ success: false, message: 'Full name is required' });
        }
        if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
            return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
        }
        if (!password || password.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
        }

        // Check if user exists
        const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // Hash password
        const bcrypt = await import('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await User.create({
            email,
            password: hashedPassword,
            name
        });

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        console.log(email, password);

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Check for user
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Your account has been deactivated. Please contact support.'
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate token
        const token = generateToken(user._id);

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get Google OAuth URL
// @route   GET /api/auth/google
// @access  Public
export const getGoogleAuthUrl = (req, res) => {
    const { platform } = req.query;
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    );

    const scopes = [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/contacts'
    ];

    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        prompt: 'consent',
        state: platform || 'web'
    });

    res.json({
        success: true,
        url
    });
};

// @desc    Google OAuth callback
// @route   GET /api/auth/google/callback
// @access  Public
export const googleCallback = async (req, res, next) => {
    try {
        const { code, state } = req.query;

        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
        );

        // Get tokens
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        // Get user info
        const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
        const { data } = await oauth2.userinfo.get();

        // Check if user exists
        let user = await User.findOne({ googleId: data.id });

        if (!user) {
            // Check if email exists
            user = await User.findOne({ email: data.email });

            if (user) {
                // Link Google account to existing user
                user.googleId = data.id;
                user.googleAccessToken = tokens.access_token;
                user.googleRefreshToken = tokens.refresh_token;
                user.profilePicture = data.picture;
                await user.save();
            } else {
                // Create new user
                user = await User.create({
                    email: data.email,
                    name: data.name,
                    googleId: data.id,
                    googleAccessToken: tokens.access_token,
                    googleRefreshToken: tokens.refresh_token,
                    profilePicture: data.picture
                });
            }
        } else {
            // Update tokens
            user.googleAccessToken = tokens.access_token;
            if (tokens.refresh_token) {
                user.googleRefreshToken = tokens.refresh_token;
            }
            await user.save();
        }

        if (!user.isActive) {
            // Redirect to error page or handle deactivation for Google Login
            // For mobile, we might need a specific error parameter
            if (state === 'mobile') {
                return res.redirect(`businesscardapp://auth/callback?error=Account deactivated`);
            } else {
                return res.redirect(`${process.env.CLIENT_URL}/login?error=Account deactivated`);
            }
        }

        // Generate JWT token
        const token = generateToken(user._id);

        // Redirect based on platform
        if (state === 'mobile') {
            res.redirect(`businesscardapp://auth/callback?token=${token}`);
        } else {
            res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
    res.json({
        success: true,
        user: req.user
    });
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = (req, res) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });

    res.json({
        success: true,
        message: 'Logged out successfully'
    });
};

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
export const updateDetails = async (req, res, next) => {
    try {
        const { name, email } = req.body;

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (name) user.name = name;

        if (email && email !== user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already in use'
                });
            }
            user.email = email;
        }

        await user.save();

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete user account and all associated data
// @route   DELETE /api/auth/deleteaccount
// @access  Private
export const deleteAccount = async (req, res, next) => {
    try {
        const userId = req.user._id;

        // Find user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Find all cards of user to delete their files
        const BusinessCard = (await import('../models/BusinessCard.model.js')).default;
        const cards = await BusinessCard.find({ userId });

        const path = await import('path');
        const fs = await import('fs');
        const { fileURLToPath } = await import('url');

        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);

        for (const card of cards) {
            // Helper to get absolute path of uploaded image
            const deleteImageFile = (imageUrl) => {
                if (!imageUrl) return;
                const filename = path.basename(imageUrl);
                const absolutePath = path.join(__dirname, '..', 'uploads', filename);
                if (fs.existsSync(absolutePath)) {
                    try {
                        fs.unlinkSync(absolutePath);
                    } catch (err) {
                        console.error(`Failed to delete file: ${absolutePath}`, err);
                    }
                }
            };

            deleteImageFile(card.frontImageUrl);
            deleteImageFile(card.backImageUrl);
            deleteImageFile(card.imageUrl);
        }

        // Delete all business cards
        await BusinessCard.deleteMany({ userId });

        // Delete user
        await User.findByIdAndDelete(userId);

        // Clear cookie if any
        res.cookie('token', 'none', {
            expires: new Date(Date.now() + 10 * 1000),
            httpOnly: true
        });

        res.json({
            success: true,
            message: 'Account and all associated data deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete user account from web interface
// @route   POST /api/auth/deleteaccount-web
// @access  Public (Requires email & password verification in body)
export const deleteAccountWeb = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide both email and password'
            });
        }

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Invalid credentials or user not found'
            });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const userId = user._id;

        // Find all cards of user to delete their files
        const BusinessCard = (await import('../models/BusinessCard.model.js')).default;
        const cards = await BusinessCard.find({ userId });

        const path = await import('path');
        const fs = await import('fs');
        const { fileURLToPath } = await import('url');

        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);

        for (const card of cards) {
            const deleteImageFile = (imageUrl) => {
                if (!imageUrl) return;
                const filename = path.basename(imageUrl);
                const absolutePath = path.join(__dirname, '..', 'uploads', filename);
                if (fs.existsSync(absolutePath)) {
                    try {
                        fs.unlinkSync(absolutePath);
                    } catch (err) {
                        console.error(`Failed to delete file: ${absolutePath}`, err);
                    }
                }
            };

            deleteImageFile(card.frontImageUrl);
            deleteImageFile(card.backImageUrl);
            deleteImageFile(card.imageUrl);
        }

        // Delete all business cards
        await BusinessCard.deleteMany({ userId });

        // Delete user
        await User.findByIdAndDelete(userId);

        res.json({
            success: true,
            message: 'Your account and all associated data have been permanently deleted.'
        });
    } catch (error) {
        next(error);
    }
};

