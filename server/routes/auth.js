import express from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  updateProfile,
  refreshAccessToken,
  googleAuthRedirect,
  googleAuthCallback,
  getLoginLogs
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/refresh', refreshAccessToken);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.get('/logs', protect, getLoginLogs);

// Google OAuth 2.0
router.get('/google', googleAuthRedirect);
router.get('/google/callback', googleAuthCallback);

export default router;
