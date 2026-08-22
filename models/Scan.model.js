import mongoose from 'mongoose';
import { randomUUID } from 'crypto';

const scanSchema = new mongoose.Schema({
    // Unique identifier for this scan (separate from Mongo's _id)
    scanId: {
        type: String,
        default: () => randomUUID(),
        unique: true,
        index: true
    },
    // e.g. business_card, contact_card, qr_url, qr_email, qr_phone,
    // social_post, linkedin_post, instagram_post, screenshot, company_card, text, other
    sourceType: {
        type: String,
        trim: true,
        default: 'other'
    },
    name: {
        type: String,
        trim: true,
        default: ''
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        default: ''
    },
    phone: {
        type: String,
        trim: true,
        default: ''
    },
    company: {
        type: String,
        trim: true,
        default: ''
    },
    designation: {
        type: String,
        trim: true,
        default: ''
    },
    website: {
        type: String,
        trim: true,
        default: ''
    },
    address: {
        type: String,
        trim: true,
        default: ''
    },
    socialLinks: [{
        type: String,
        trim: true
    }],
    sourceUrl: {
        type: String,
        trim: true,
        default: ''
    },
    rawText: {
        type: String,
        default: ''
    },
    // Scans are always saved to MongoDB immediately, but only pushed to
    // Google Sheets when the user explicitly taps "Save" on the result.
    syncedToSheet: {
        type: Boolean,
        default: false
    },
    syncedAt: {
        type: Date
    }
}, {
    timestamps: true
});

scanSchema.index({ createdAt: -1 });

const Scan = mongoose.model('Scan', scanSchema);

export default Scan;
