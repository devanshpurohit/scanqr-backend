import express from 'express';
import { scanQr, scanImage, getScans, getScan, saveScanToSheet } from '../controllers/scan.controller.js';
import upload from '../middlewares/upload.middleware.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Every scan route requires a logged-in user — the authenticated identity
// (req.user) is what gets attached to each scan, never anything the
// frontend sends directly.
router.use(protect);

// Frontend has already decoded the QR code and sends the raw string
router.post('/qr', scanQr);

// Frontend uploads an image (business card, screenshot, social post, etc.)
router.post('/image', upload.single('image'), scanImage);

// History: list + single lookup (scoped to the logged-in user)
router.get('/', getScans);
router.get('/:scanId', getScan);

// User tapped "Save" on a scan result — push it into Google Sheets now
router.post('/:scanId/save', saveScanToSheet);

export default router;
