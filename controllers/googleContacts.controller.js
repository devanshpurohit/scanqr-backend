import BusinessCard from '../models/BusinessCard.model.js';
import User from '../models/User.model.js';
import { syncToGoogleContacts, deleteFromGoogleContacts } from '../utils/googleApi.service.js';

// @desc    Sync single card to Google Contacts
// @route   POST /api/google/sync/:cardId
// @access  Private
export const syncCard = async (req, res, next) => {
    try {
        const card = await BusinessCard.findOne({
            _id: req.params.cardId,
            userId: req.user._id
        });

        if (!card) {
            return res.status(404).json({
                success: false,
                message: 'Business card not found'
            });
        }

        // Check if user has Google tokens
        if (!req.user.googleAccessToken || !req.user.googleRefreshToken) {
            return res.status(400).json({
                success: false,
                message: 'Please connect your Google account first'
            });
        }

        // Sync to Google Contacts
        const googleContactId = await syncToGoogleContacts(
            card,
            req.user.googleAccessToken,
            req.user.googleRefreshToken
        );

        // Update card
        card.isGoogleSynced = true;
        card.googleContactId = googleContactId;
        card.lastSyncedAt = new Date();
        await card.save();

        res.json({
            success: true,
            message: 'Business card synced to Google Contacts successfully',
            card
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Sync all cards to Google Contacts
// @route   POST /api/google/sync-all
// @access  Private
export const syncAllCards = async (req, res, next) => {
    try {
        // Check if user has Google tokens
        if (!req.user.googleAccessToken || !req.user.googleRefreshToken) {
            return res.status(400).json({
                success: false,
                message: 'Please connect your Google account first'
            });
        }

        const cards = await BusinessCard.find({ userId: req.user._id });

        let syncedCount = 0;
        let failedCount = 0;

        for (const card of cards) {
            try {
                const googleContactId = await syncToGoogleContacts(
                    card,
                    req.user.googleAccessToken,
                    req.user.googleRefreshToken
                );

                card.isGoogleSynced = true;
                card.googleContactId = googleContactId;
                card.lastSyncedAt = new Date();
                await card.save();

                syncedCount++;
            } catch (error) {
                console.error(`Failed to sync card ${card._id}:`, error);
                failedCount++;
            }
        }

        res.json({
            success: true,
            message: `Synced ${syncedCount} cards to Google Contacts`,
            syncedCount,
            failedCount,
            totalCards: cards.length
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Remove card from Google Contacts
// @route   DELETE /api/google/sync/:cardId
// @access  Private
export const unsyncCard = async (req, res, next) => {
    try {
        const card = await BusinessCard.findOne({
            _id: req.params.cardId,
            userId: req.user._id
        });

        if (!card) {
            return res.status(404).json({
                success: false,
                message: 'Business card not found'
            });
        }

        if (!card.isGoogleSynced || !card.googleContactId) {
            return res.status(400).json({
                success: false,
                message: 'Card is not synced with Google Contacts'
            });
        }

        // Delete from Google Contacts
        await deleteFromGoogleContacts(
            card.googleContactId,
            req.user.googleAccessToken,
            req.user.googleRefreshToken
        );

        // Update card
        card.isGoogleSynced = false;
        card.googleContactId = null;
        card.lastSyncedAt = null;
        await card.save();

        res.json({
            success: true,
            message: 'Business card removed from Google Contacts successfully',
            card
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get Google sync status
// @route   GET /api/google/status
// @access  Private
export const getSyncStatus = async (req, res, next) => {
    try {
        const isConnected = !!(req.user.googleAccessToken && req.user.googleRefreshToken);

        const totalCards = await BusinessCard.countDocuments({ userId: req.user._id });
        const syncedCards = await BusinessCard.countDocuments({
            userId: req.user._id,
            isGoogleSynced: true
        });

        res.json({
            success: true,
            status: {
                isConnected,
                totalCards,
                syncedCards,
                unsyncedCards: totalCards - syncedCards
            }
        });
    } catch (error) {
        next(error);
    }
};
