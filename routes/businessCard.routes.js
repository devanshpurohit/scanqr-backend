import express from 'express';
import { createCard, analyzeCard, getCards, getCard, updateCard, deleteCard, getStats } from '../controllers/businessCard.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import upload from '../middlewares/upload.middleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.post('/analyze', upload.fields([
    { name: 'frontImage', maxCount: 1 },
    { name: 'backImage', maxCount: 1 }
]), analyzeCard);

router.post('/', upload.fields([
    { name: 'frontImage', maxCount: 1 },
    { name: 'backImage', maxCount: 1 }
]), createCard); // Modified to allow JSON body or file upload fallback
router.get('/', getCards);
router.get('/stats', getStats);
router.get('/:id', getCard);
router.put('/:id', updateCard);
router.delete('/:id', deleteCard);

export default router;
