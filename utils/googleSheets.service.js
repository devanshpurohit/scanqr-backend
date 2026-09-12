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

// The original 13 scan columns — left exactly as they were.
const CORE_HEADER = [
    'Scan ID', 'Timestamp', 'Source Type', 'Name', 'Email', 'Phone',
    'Company', 'Designation', 'Website', 'Address', 'Social Links',
    'Source URL', 'Raw Text'
];

// Appended at the end so existing sheets/columns are never disturbed.
const USER_HEADER = ['User ID', 'User Name', 'User Email'];

const HEADER_ROW = [...CORE_HEADER, ...USER_HEADER];
const LAST_COLUMN = 'P'; // A..M (core, 13 cols) + N..P (user, 3 cols)

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
    scan.rawText || '',
    // Who was logged in when this scan was made (see scan.controller.js's
    // withAuthenticatedUser — always server-derived, never client-supplied).
    scan.userId ? String(scan.userId) : '',
    scan.userName || '',
    scan.userEmail || ''
];

// Cache the actual first tab's title per spreadsheet — instead of assuming
// it's literally named "Sheet1" (which breaks the moment someone renames
// the tab), we ask Google for the real name once and reuse it.
const sheetTitleCache = new Map();

const getFirstSheetTitle = async (sheets, spreadsheetId) => {
    if (sheetTitleCache.has(spreadsheetId)) {
        return sheetTitleCache.get(spreadsheetId);
    }
    const { data } = await sheets.spreadsheets.get({
        spreadsheetId,
        fields: 'sheets.properties.title'
    });
    const title = data.sheets?.[0]?.properties?.title;
    if (!title) {
        throw new Error('Could not find a tab in the target Google Sheet');
    }
    sheetTitleCache.set(spreadsheetId, title);
    return title;
};

/**
 * Make sure the header row exists as row 1.
 * - Brand-new/empty sheet: writes the full header (core + user columns).
 * - Sheet already has a row 1 (an older header, or even real data from
 *   before this feature existed): left completely untouched, EXCEPT the
 *   new User ID/Name/Email column labels (N1:P1) are patched in if they're
 *   not already there. Existing columns are never rewritten or reordered.
 */
const ensureHeaderRow = async (sheets, spreadsheetId, sheetTitle) => {
    const { data } = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `'${sheetTitle}'!A1:${LAST_COLUMN}1`
    });
    const existing = data.values?.[0] || [];

    if (existing.length === 0) {
        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `'${sheetTitle}'!A1:${LAST_COLUMN}1`,
            valueInputOption: 'RAW',
            requestBody: { values: [HEADER_ROW] }
        });
        return;
    }

    if (existing.length < HEADER_ROW.length) {
        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `'${sheetTitle}'!N1:${LAST_COLUMN}1`,
            valueInputOption: 'RAW',
            requestBody: { values: [USER_HEADER] }
        });
    }
};

/**
 * Find the next empty row number (1-based) by reading column A and counting
 * how many rows already have something in it.
 */
const getNextRowNumber = async (sheets, spreadsheetId, sheetTitle) => {
    const { data } = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `'${sheetTitle}'!A:A`
    });
    return (data.values?.length || 0) + 1;
};

/**
 * Append a single scan record as a new row in the configured Google Sheet.
 * Throws on failure — callers should catch this so a Sheets outage never
 * blocks/rolls back the MongoDB save.
 *
 * Deliberately does NOT use the Sheets API's `values.append` — that method
 * tries to auto-detect "the table" from existing data and aligns new rows
 * to whatever shape it guesses, which silently drifts columns for good once
 * a single malformed/partial row confuses it. Instead we compute the exact
 * next row ourselves and `update` that exact range, so every column always
 * lands exactly where it's supposed to regardless of what's already there.
 * @param {Object} scan - A Scan document (or plain object with the same shape).
 */
export const appendScanToSheet = async (scan) => {
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    if (!spreadsheetId) {
        throw new Error('GOOGLE_SHEET_ID is not configured');
    }

    const sheets = getSheetsClient();
    const sheetTitle = await getFirstSheetTitle(sheets, spreadsheetId);

    await ensureHeaderRow(sheets, spreadsheetId, sheetTitle);

    const row = await getNextRowNumber(sheets, spreadsheetId, sheetTitle);

    await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `'${sheetTitle}'!A${row}:${LAST_COLUMN}${row}`,
        // RAW (not USER_ENTERED): store the exact string we send, with NO
        // Sheets-side auto-formatting/parsing (no auto date/number
        // conversion, no formula interpretation).
        valueInputOption: 'RAW',
        requestBody: { values: [toRow(scan)] }
    });
};

export { HEADER_ROW };
