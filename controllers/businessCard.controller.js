import BusinessCard from '../models/BusinessCard.model.js';
import { processImageWithOpenAI } from '../utils/openai.service.js';
import fs from 'fs';
import path from 'path';

// @desc    Analyze business card image(s)
// @route   POST /api/cards/analyze
// @access  Private
export const analyzeCard = async (req, res, next) => {
    try {
        const files = req.files || {};
        const frontImage = files.frontImage ? files.frontImage[0] : null;
        const backImage = files.backImage ? files.backImage[0] : null;

        if (!frontImage) {
            return res.status(400).json({
                success: false,
                message: 'Please upload at least a front image'
            });
        }

        const frontImageUrl = `/uploads/${frontImage.filename}`;
        const backImageUrl = backImage ? `/uploads/${backImage.filename}` : null;

        // Process images with OpenAI Vision
        const { data, rawText, confidence } = await processImageWithOpenAI(
            frontImage.path,
            backImage ? backImage.path : null
        );

        res.json({
            success: true,
            data: {
                ...data,
                frontImageUrl,
                backImageUrl,
                rawOcrText: rawText,
                ocrConfidence: confidence
            }
        });
    } catch (error) {
        // Delete uploaded files if analysis fails
        const files = req.files || {};
        if (files.frontImage && files.frontImage[0]) fs.unlinkSync(files.frontImage[0].path);
        if (files.backImage && files.backImage[0]) fs.unlinkSync(files.backImage[0].path);
        next(error);
    }
};

// @desc    Create business card (Save)
// @route   POST /api/cards
// @access  Private
export const createCard = async (req, res, next) => {
    try {
        // Handle direct upload creation (Legacy/Fallback) OR JSON creation (New Flow)
        let cardData = { ...req.body };

        // If files are uploaded directly to this endpoint (Legacy flow support)
        if (req.files && (req.files.frontImage || req.files.image)) {
            const frontImage = req.files.frontImage ? req.files.frontImage[0] : req.files.image[0];
            const backImage = req.files.backImage ? req.files.backImage[0] : null;

            const { data, rawText, confidence } = await processImageWithOpenAI(
                frontImage.path,
                backImage ? backImage.path : null
            );

            cardData = {
                ...cardData,
                ...data,
                frontImageUrl: `/uploads/${frontImage.filename}`,
                backImageUrl: backImage ? `/uploads/${backImage.filename}` : null,
                imageUrl: `/uploads/${frontImage.filename}`, // Fallback
                rawOcrText: rawText,
                ocrConfidence: confidence
            };
        }

        // Validation: Must have at least frontImageUrl (either from body or file upload)
        if (!cardData.frontImageUrl) {
            return res.status(400).json({
                success: false,
                message: 'Front image URL is required'
            });
        }

        // Ensure imageUrl fallback is set if missing
        if (!cardData.imageUrl) {
            cardData.imageUrl = cardData.frontImageUrl;
        }

        // Create business card
        const card = await BusinessCard.create({
            userId: req.user._id,
            ...cardData
        });

        res.status(201).json({
            success: true,
            message: 'Business card saved successfully',
            card
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all business cards for user
// @route   GET /api/cards
// @access  Private
export const getCards = async (req, res, next) => {
    try {
        const { search, favorite, page = 1, limit = 20 } = req.query;

        const query = { userId: req.user._id };

        // Search filter
        if (search) {
            query.$text = { $search: search };
        }

        // Favorite filter
        if (favorite === 'true') {
            query.isFavorite = true;
        }

        const cards = await BusinessCard.find(query)
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

// @desc    Get single business card
// @route   GET /api/cards/:id
// @access  Private
export const getCard = async (req, res, next) => {
    try {
        const card = await BusinessCard.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!card) {
            return res.status(404).json({
                success: false,
                message: 'Business card not found'
            });
        }

        res.json({
            success: true,
            card
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update business card
// @route   PUT /api/cards/:id
// @access  Private
export const updateCard = async (req, res, next) => {
    try {
        const { name, company, position, email, phone, address, website, notes, tags, isFavorite } = req.body;

        let card = await BusinessCard.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!card) {
            return res.status(404).json({
                success: false,
                message: 'Business card not found'
            });
        }

        // Update fields
        if (name !== undefined) card.name = name;
        if (company !== undefined) card.company = company;
        if (position !== undefined) card.position = position;
        if (email !== undefined) card.email = email;
        if (phone !== undefined) card.phone = phone;
        if (address !== undefined) card.address = address;
        if (website !== undefined) card.website = website;
        if (notes !== undefined) card.notes = notes;
        if (tags !== undefined) card.tags = tags;
        if (tags !== undefined) card.tags = tags;
        if (isFavorite !== undefined) card.isFavorite = isFavorite;

        // Update extra fields
        if (req.body.extraFields !== undefined) {
            card.extraFields = req.body.extraFields;
        }

        await card.save();

        res.json({
            success: true,
            message: 'Business card updated successfully',
            card
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete business card
// @route   DELETE /api/cards/:id
// @access  Private
export const deleteCard = async (req, res, next) => {
    try {
        const card = await BusinessCard.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!card) {
            return res.status(404).json({
                success: false,
                message: 'Business card not found'
            });
        }

        // Delete image file
        const imagePath = path.join(process.cwd(), card.imageUrl);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
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

// @desc    Get user statistics
// @route   GET /api/cards/stats
// @access  Private
export const getStats = async (req, res, next) => {
    try {
        const totalCards = await BusinessCard.countDocuments({ userId: req.user._id });
        const syncedCards = await BusinessCard.countDocuments({
            userId: req.user._id,
            isGoogleSynced: true
        });
        const favoriteCards = await BusinessCard.countDocuments({
            userId: req.user._id,
            isFavorite: true
        });

        res.json({
            success: true,
            stats: {
                totalCards,
                syncedCards,
                favoriteCards,
                syncPercentage: totalCards > 0 ? Math.round((syncedCards / totalCards) * 100) : 0
            }
        });
    } catch (error) {
        next(error);
    }
};
