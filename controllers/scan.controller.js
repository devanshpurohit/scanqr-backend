import fs from 'fs';
import Scan from '../models/Scan.model.js';
import { parseQrData } from '../utils/qr.service.js';
import { analyzeImageWithOpenAI } from '../utils/openai.service.js';
import { createScan, syncScanToSheet } from '../utils/scan.service.js';

// @desc    Process already-decoded QR data (frontend decodes the QR, backend
//          extracts useful information from the resulting string) and save it
// @route   POST /api/scan/qr
// @access  Public
export const scanQr = async (req, res, next) => {
    try {
        const { data } = req.body;

        if (!data || typeof data !== 'string' || !data.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Please provide the decoded QR "data" as a string'
            });
        }

        const parsed = parseQrData(data);
        const scan = await createScan(parsed);

        res.status(201).json({
            success: true,
            scan
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Process an uploaded image (business card, contact card, screenshot,
//          social media post, company card, etc.) with OpenAI Vision and save it
// @route   POST /api/scan/image
// @access  Public
export const scanImage = async (req, res, next) => {
    const file = req.file;

    try {
        if (!file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload an image file (field name: "image")'
            });
        }

        const extracted = await analyzeImageWithOpenAI(file.path);
        const scan = await createScan(extracted);

        res.status(201).json({
            success: true,
            scan
        });
    } catch (error) {
        next(error);
    } finally {
        // The image itself isn't stored as part of a Scan record, so clean up
        // the temp upload regardless of success/failure.
        if (file) {
            fs.unlink(file.path, (err) => {
                if (err) console.error('Failed to delete temp upload:', file.path, err.message);
            });
        }
    }
};

// @desc    Get recent scans (history), newest first
// @route   GET /api/scan
// @access  Public
export const getScans = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, sourceType, search } = req.query;

        const query = {};
        if (sourceType) query.sourceType = sourceType;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { company: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { rawText: { $regex: search, $options: 'i' } }
            ];
        }

        const scans = await Scan.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await Scan.countDocuments(query);

        res.json({
            success: true,
            scans,
            totalPages: Math.ceil(count / limit),
            currentPage: Number(page),
            total: count
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Push an already-saved scan into Google Sheets (user tapped "Save")
// @route   POST /api/scan/:scanId/save
// @access  Public
export const saveScanToSheet = async (req, res, next) => {
    try {
        const scan = await syncScanToSheet(req.params.scanId);

        res.json({
            success: true,
            message: 'Saved to Google Sheets',
            scan
        });
    } catch (error) {
        // A Sheets/credentials failure shouldn't look like a generic 500 —
        // the scan itself is still safe in MongoDB either way.
        next(Object.assign(error, {
            status: error.status || 502,
            message: error.status === 404 ? error.message : `Could not save to Google Sheets: ${error.message}`
        }));
    }
};

// @desc    Get a single scan by its scanId
// @route   GET /api/scan/:scanId
// @access  Public
export const getScan = async (req, res, next) => {
    try {
        const scan = await Scan.findOne({ scanId: req.params.scanId });

        if (!scan) {
            return res.status(404).json({
                success: false,
                message: 'Scan not found'
            });
        }

        res.json({
            success: true,
            scan
        });
    } catch (error) {
        next(error);
    }
};
