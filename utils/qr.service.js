// Parses already-decoded QR code data (plain string) into normalized scan
// fields WITHOUT calling any AI API. Handles vCard/MECARD contact QR codes,
// mailto:/tel:/smsto: links, plain URLs (incl. social media links), emails,
// phone numbers and falls back to plain text.

const EMAIL_REGEX = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/;
const PHONE_REGEX = /\+?\d[\d\s\-().]{6,}\d/;
const URL_REGEX = /\bhttps?:\/\/[^\s]+|\bwww\.[^\s]+/i;

const SOCIAL_DOMAINS = [
    'linkedin.com', 'instagram.com', 'facebook.com', 'fb.com',
    'twitter.com', 'x.com', 'tiktok.com', 'youtube.com', 'youtu.be',
    'wa.me', 'whatsapp.com', 't.me', 'telegram.me', 'pinterest.com', 'threads.net'
];

const normalizeUrl = (url) => (/^https?:\/\//i.test(url) ? url : `https://${url}`);

const isSocialUrl = (url) => {
    try {
        const hostname = new URL(normalizeUrl(url)).hostname.replace(/^www\./, '').toLowerCase();
        return SOCIAL_DOMAINS.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`));
    } catch {
        return false;
    }
};

// Splits a vCard/MECARD "KEY;PARAM=X:value" line into { key, value }
const splitField = (line) => {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) return null;
    const rawKey = line.slice(0, colonIndex).split(';')[0].trim().toUpperCase();
    const value = line.slice(colonIndex + 1).trim();
    return { key: rawKey, value };
};

const parseVCard = (text) => {
    const fields = { name: '', email: '', phone: '', company: '', designation: '', website: '', address: '' };
    const lines = text.split(/\r?\n/);

    for (const rawLine of lines) {
        const field = splitField(rawLine);
        if (!field || !field.value) continue;
        const { key, value } = field;

        if ((key === 'FN' || key === 'N') && !fields.name) {
            // N format is "Last;First;Middle;Prefix;Suffix"
            fields.name = key === 'N'
                ? value.split(';').filter(Boolean).reverse().join(' ').trim()
                : value;
        } else if (key === 'EMAIL' && !fields.email) {
            fields.email = value;
        } else if (key === 'TEL' && !fields.phone) {
            fields.phone = value;
        } else if (key === 'ORG' && !fields.company) {
            fields.company = value.split(';')[0];
        } else if (key === 'TITLE' && !fields.designation) {
            fields.designation = value;
        } else if (key === 'URL' && !fields.website) {
            fields.website = value;
        } else if (key === 'ADR' && !fields.address) {
            // ADR format: PO Box;Extended;Street;City;State;Postal;Country
            fields.address = value.split(';').filter(Boolean).join(', ');
        }
    }

    return fields;
};

const parseMeCard = (text) => {
    const fields = { name: '', email: '', phone: '', company: '', designation: '', website: '', address: '' };
    const body = text.replace(/^MECARD:/i, '').replace(/;;$/, '');
    const segments = body.split(';');

    for (const segment of segments) {
        const field = splitField(segment);
        if (!field || !field.value) continue;
        const { key, value } = field;

        if (key === 'N' && !fields.name) fields.name = value.split(',').reverse().join(' ').trim();
        else if (key === 'EMAIL' && !fields.email) fields.email = value;
        else if (key === 'TEL' && !fields.phone) fields.phone = value;
        else if (key === 'ORG' && !fields.company) fields.company = value;
        else if (key === 'URL' && !fields.website) fields.website = value;
        else if (key === 'ADR' && !fields.address) fields.address = value;
    }

    return fields;
};

/**
 * Parse decoded QR string data into normalized scan fields.
 * @param {string} rawData - Decoded QR content sent by the frontend.
 * @returns {Object} Normalized fields matching the Scan model.
 */
export const parseQrData = (rawData) => {
    const text = String(rawData ?? '').trim();

    const result = {
        sourceType: 'text',
        name: '',
        email: '',
        phone: '',
        company: '',
        designation: '',
        website: '',
        address: '',
        socialLinks: [],
        sourceUrl: '',
        rawText: text
    };

    if (!text) {
        return result;
    }

    const upper = text.toUpperCase();

    if (upper.startsWith('BEGIN:VCARD')) {
        Object.assign(result, parseVCard(text));
        result.sourceType = 'contact_card';
    } else if (upper.startsWith('MECARD:')) {
        Object.assign(result, parseMeCard(text));
        result.sourceType = 'contact_card';
    } else if (upper.startsWith('MAILTO:')) {
        result.email = text.slice(7).split('?')[0].trim();
        result.sourceType = 'email';
    } else if (upper.startsWith('TEL:') || upper.startsWith('SMSTO:')) {
        result.phone = text.split(':').slice(1).join(':').trim();
        result.sourceType = 'phone';
    } else if (/^(https?:\/\/|www\.)/i.test(text)) {
        const url = normalizeUrl(text);
        result.website = url;
        result.sourceUrl = url;
        if (isSocialUrl(url)) {
            result.socialLinks = [url];
            result.sourceType = 'social_url';
        } else {
            result.sourceType = 'url';
        }
    } else if (EMAIL_REGEX.test(text) && text.split(/\s+/).length === 1) {
        result.email = text.match(EMAIL_REGEX)[0];
        result.sourceType = 'email';
    } else if (/^[\d\s\-+().]+$/.test(text) && text.replace(/\D/g, '').length >= 7) {
        // Entire QR content is digits/phone punctuation only
        result.phone = text.trim();
        result.sourceType = 'phone';
    } else {
        result.sourceType = 'text';
    }

    // Best-effort supplemental extraction: even for plain text QR content,
    // surface any email/phone/url found embedded in it.
    if (!result.email) {
        const match = text.match(EMAIL_REGEX);
        if (match) result.email = match[0];
    }
    if (!result.phone) {
        const match = text.match(PHONE_REGEX);
        if (match) result.phone = match[0].trim();
    }
    if (!result.website) {
        const match = text.match(URL_REGEX);
        if (match) {
            const url = normalizeUrl(match[0]);
            result.website = url;
            if (!result.sourceUrl) result.sourceUrl = url;
            if (isSocialUrl(url) && !result.socialLinks.length) result.socialLinks = [url];
        }
    }

    return result;
};
