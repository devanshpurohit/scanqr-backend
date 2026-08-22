import express from 'express';
import { register, login, getGoogleAuthUrl, googleCallback, getMe, logout, updateDetails, deleteAccount, deleteAccountWeb } from '../controllers/auth.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/google', getGoogleAuthUrl);
router.get('/google/callback', googleCallback);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.put('/updatedetails', protect, updateDetails);
router.delete('/deleteaccount', protect, deleteAccount);
router.post('/deleteaccount-web', deleteAccountWeb);



export default router;
