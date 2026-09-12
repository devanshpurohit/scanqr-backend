import Scan from '../models/Scan.model.js';
import { appendScanToSheet } from './googleSheets.service.js';
import { createPerfexLead } from './perfexCrm.service.js';

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
    rawText: payload.rawText || '',
    // Identity of the logged-in user who performed the scan (set by the
    // controller from req.user — see auth.middleware.js's `protect`).
    userId: payload.userId || undefined,
    userName: payload.userName || '',
    userEmail: payload.userEmail || ''
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
 * Append an already-saved scan to Google Sheets AND create a matching Lead
 * in Perfex CRM — both happen on the same "Save" tap. Throws if the scan
 * doesn't exist (or doesn't belong to `userId`, when provided) or the
 * Sheets append fails, since Sheets is the primary, user-facing part of
 * "Save" — the caller (controller) is expected to report that back to the
 * user. The Perfex CRM push is kept resilient instead (like the original
 * Sheets-only flow used to be): a CRM outage is recorded on the scan and
 * logged, but never undoes the Sheets save or fails the request.
 * @param {string} scanId
 * @param {string} [userId] - When provided, only that user's own scan can be synced.
 * @returns {Promise<Object>} The updated Scan document.
 */
export const syncScanToSheet = async (scanId, userId) => {
    const scan = await Scan.findOne(userId ? { scanId, userId } : { scanId });
    if (!scan) {
        const error = new Error('Scan not found');
        error.status = 404;
        throw error;
    }

    // Idempotent: a double-tap or a retried request after a dropped response
    // should never produce a second row/lead for the same scan.
    if (!scan.syncedToSheet) {
        await appendScanToSheet(scan);
        scan.syncedToSheet = true;
        scan.syncedAt = new Date();
    }

    if (!scan.syncedToCrm) {
        try {
            const leadId = await createPerfexLead(scan);
            scan.syncedToCrm = true;
            scan.crmLeadId = String(leadId);
            scan.crmSyncError = '';
        } catch (error) {
            scan.crmSyncError = error.message;
            console.error('⚠️  Perfex CRM lead creation failed (scan/sheet still saved):', error.message);
        }
    }

    await scan.save();

    return scan;
};
