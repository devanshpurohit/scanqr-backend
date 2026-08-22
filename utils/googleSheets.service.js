import { google } from 'googleapis';

// Lazy singleton, same pattern as openai.service.js's getOpenAIClient()
let sheetsClient = null;

const getSheetsClient = () => {
    if (!sheetsClient) {
        const { GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY } = process.env;

        if (!GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY) {
            throw new Error('Google Sheets is not configured (missing GOOGLE_SERVICE_ACCOUNT_EMAIL / GOOGLE_PRIVATE_KEY)');
        }

        const auth = new google.auth.JWT({
            email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
            // .env stores the key with literal \n sequences; convert back to real newlines
            key: GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            scopes: ['https://www.googleapis.com/auth/spreadsheets']
        });

        sheetsClient = google.sheets({ version: 'v4', auth });
    }

    return sheetsClient;
};

const SHEET_RANGE = 'Sheet1!A:M';

const HEADER_ROW = [
    'Scan ID', 'Timestamp', 'Source Type', 'Name', 'Email', 'Phone',
    'Company', 'Designation', 'Website', 'Address', 'Social Links',
    'Source URL', 'Raw Text'
];

const toRow = (scan) => [
    scan.scanId || '',
    new Date(scan.createdAt || Date.now()).toISOString(),
    scan.sourceType || '',
    scan.name || '',
    scan.email || '',
    scan.phone || '',
    scan.company || '',
    scan.designation || '',
    scan.website || '',
    scan.address || '',
    Array.isArray(scan.socialLinks) ? scan.socialLinks.join(', ') : '',
    scan.sourceUrl || '',
    scan.rawText || ''
];

/**
 * Append a single scan record as a new row in the configured Google Sheet.
 * Throws on failure — callers should catch this so a Sheets outage never
 * blocks/rolls back the MongoDB save.
 * @param {Object} scan - A Scan document (or plain object with the same shape).
 */
export const appendScanToSheet = async (scan) => {
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    if (!spreadsheetId) {
        throw new Error('GOOGLE_SHEET_ID is not configured');
    }

    const sheets = getSheetsClient();

    await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: SHEET_RANGE,
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        requestBody: { values: [toRow(scan)] }
    });
};

export { HEADER_ROW };
