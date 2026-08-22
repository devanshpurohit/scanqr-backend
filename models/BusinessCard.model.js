import mongoose from 'mongoose';

const businessCardSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    // Extracted information
    name: {
        type: String,
        trim: true
    },
    company: {
        type: String,
        trim: true
    },
    position: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    phone: [{
        type: String,
        trim: true
    }],
    address: {
        type: String,
        trim: true
    },
    website: {
        type: String,
        trim: true
    },
    // Additional fields
    notes: {
        type: String,
        trim: true
    },
    // Image data
    frontImageUrl: {
        type: String,
        required: true
    },
    backImageUrl: {
        type: String
    },
    imageUrl: {
        type: String // We'll keep this as a fallback/alias to frontImageUrl for backward compatibility
    },
    // Extra Fields (Dynamic)
    extraFields: [{
        label: String,
        value: String
    }],
    // OCR data
    rawOcrText: {
        type: String
    },
    ocrConfidence: {
        type: Number,
        min: 0,
        max: 100
    },
    // Google Contacts sync
    isGoogleSynced: {
        type: Boolean,
        default: false
    },
    googleContactId: {
        type: String,
        sparse: true
    },
    lastSyncedAt: {
        type: Date
    },
    // Tags for organization
    tags: [{
        type: String,
        trim: true
    }],
    // Favorite flag
    isFavorite: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Indexes for search
businessCardSchema.index({ name: 'text', company: 'text', email: 'text' });
businessCardSchema.index({ userId: 1, createdAt: -1 });

const BusinessCard = mongoose.model('BusinessCard', businessCardSchema);

export default BusinessCard;
