// Pushes a scan into Perfex CRM as a Lead, using Perfex's REST API module
// (auth via a static `authtoken` header — not OAuth/JWT-per-user; this is a
// single shared integration token for the whole app, same as Google Sheets).

const buildDescription = (scan) => {
    const lines = [
        `Captured via Scan2Lead (source type: ${scan.sourceType || 'other'})`,
        scan.website && `Website: ${scan.website}`,
        scan.address && `Address: ${scan.address}`,
        scan.sourceUrl && `Source URL: ${scan.sourceUrl}`,
        Array.isArray(scan.socialLinks) && scan.socialLinks.length && `Social Links: ${scan.socialLinks.join(', ')}`,
        scan.userName && `Scanned by: ${scan.userName}${scan.userEmail ? ` (${scan.userEmail})` : ''}`,
        scan.rawText && `\nRaw scanned text:\n${scan.rawText}`
    ].filter(Boolean);

    return lines.join('\n');
};

/**
 * Create a Lead in Perfex CRM for a scan. Throws on failure — the caller
 * decides how to handle that (see scan.service.js: it never blocks the
 * Google Sheets save or the Mongo record, same resilience pattern already
 * used for Sheets).
 * @param {Object} scan - A Scan document (or plain object with the same shape).
 * @returns {Promise<string>} The Perfex lead's record_id.
 */
export const createPerfexLead = async (scan) => {
    const { PERFEX_CRM_URL, PERFEX_API_TOKEN, PERFEX_DEFAULT_SOURCE, PERFEX_DEFAULT_STATUS, PERFEX_DEFAULT_ASSIGNED } = process.env;

    if (!PERFEX_CRM_URL || !PERFEX_API_TOKEN) {
        throw new Error('Perfex CRM is not configured (missing PERFEX_CRM_URL / PERFEX_API_TOKEN)');
    }

    const body = {
        name: scan.name || 'Unknown',
        title: scan.designation || '',
        company: scan.company || '',
        email: scan.email || '',
        phonenumber: scan.phone || '',
        description: buildDescription(scan),
        source: PERFEX_DEFAULT_SOURCE || '1',
        status: PERFEX_DEFAULT_STATUS || '1',
        assigned: PERFEX_DEFAULT_ASSIGNED || ''
    };

    const response = await fetch(`${PERFEX_CRM_URL.replace(/\/$/, '')}/api/leads`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            authtoken: PERFEX_API_TOKEN
        },
        body: JSON.stringify(body)
    });

    const data = await response.json().catch(() => null);

    if (!response.ok || !data?.status) {
        throw new Error(data?.message || `Perfex CRM returned ${response.status}`);
    }

    return data.record_id;
};
