import { Router } from 'express';
import { body } from 'express-validator';
import passport from 'passport';
import validate from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import {
  register,
  login,
  googleCallback,
  forgotPasswordHandler,
  resetPasswordHandler,
  getMe,
  updateMe,
} from '../controllers/authController.js';

const router = Router();

// ─── Registration ────────────────────────────────────────────────────────────
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
  ],
  validate,
  register
);

// ─── Login ───────────────────────────────────────────────────────────────────
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  login
);

// ─── Google OAuth ────────────────────────────────────────────────────────────
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL?.split(',')[0] || 'http://localhost:5173'}/login?error=google_failed`,
  }),
  googleCallback
);

// ─── Forgot Password ─────────────────────────────────────────────────────────
router.post(
  '/forgot-password',
  [
    body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  ],
  validate,
  forgotPasswordHandler
);

// ─── Reset Password ──────────────────────────────────────────────────────────
router.post(
  '/reset-password/:token',
  [
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
  ],
  validate,
  resetPasswordHandler
);

// ─── Profile (Protected) ─────────────────────────────────────────────────────
router.get('/me', authenticate, getMe);
router.put('/me', authenticate, updateMe);

export default router;
