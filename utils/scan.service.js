import Scan from '../models/Scan.model.js';
import { appendScanToSheet } from './googleSheets.service.js';

const normalize = (payload = {}) => ({
    sourceType: payload.sourceType || 'other',
    name: payload.name || '',
    email: payload.email || '',
    phone: payload.phone || '',
    company: payload.company || '',
    designation: payload.designation || '',
    website: payload.website || '',
    address: payload.address || '',
    socialLinks: Array.isArray(payload.socialLinks) ? payload.socialLinks.filter(Boolean) : [],
    sourceUrl: payload.sourceUrl || '',
    rawText: payload.rawText || ''
});

/**
 * Save a scan to MongoDB. Google Sheets is NOT touched here — that only
 * happens when the user explicitly confirms via `syncScanToSheet` (see
 * below), e.g. by tapping "Save" on the scan result in the UI.
 * @param {Object} payload - Normalized scan fields (see Scan model).
 * @returns {Promise<Object>} The saved Scan document.
 */
export const createScan = async (payload) => {
    return Scan.create(normalize(payload));
};

/**
 * Append an already-saved scan to Google Sheets and mark it as synced.
 * Throws if the scan doesn't exist or the Sheets append fails — the caller
 * (controller) is expected to report that back to the user, since this is
 * now a deliberate, user-initiated action rather than a silent best-effort one.
 * @param {string} scanId
 * @returns {Promise<Object>} The updated Scan document.
 */
export const syncScanToSheet = async (scanId) => {
    const scan = await Scan.findOne({ scanId });
    if (!scan) {
        const error = new Error('Scan not found');
        error.status = 404;
        throw error;
    }

    // Idempotent: a double-tap or a retried request after a dropped response
    // should never produce a second row for the same scan.
    if (scan.syncedToSheet) {
        return scan;
    }

    await appendScanToSheet(scan);

    scan.syncedToSheet = true;
    scan.syncedAt = new Date();
    await scan.save();

    return scan;
};
