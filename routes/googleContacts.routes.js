import express from 'express';
import { syncCard, syncAllCards, unsyncCard, getSyncStatus } from '../controllers/googleContacts.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.post('/sync/:cardId', syncCard);
router.post('/sync-all', syncAllCards);
router.delete('/sync/:cardId', unsyncCard);
router.get('/status', getSyncStatus);

export default router;
