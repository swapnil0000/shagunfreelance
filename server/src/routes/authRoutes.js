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
  totpVerifyLogin,
  totpSetup,
  totpEnable,
  totpDisable,
  totpStatus,
} from '../controllers/authController.js';
import { authorize } from '../middleware/auth.js';

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
router.get('/google', (req, res, next) => {
  const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',').map(u => u.trim());
  const requested = req.query.origin ? decodeURIComponent(req.query.origin) : '';
  const origin = allowedOrigins.includes(requested) ? requested : allowedOrigins[0];
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    state: Buffer.from(origin).toString('base64'),
  })(req, res, next);
});

router.get('/google/callback', (req, res, next) => {
  const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',').map(u => u.trim());
  let origin = allowedOrigins[0];
  try {
    const decoded = Buffer.from(req.query.state || '', 'base64').toString();
    if (allowedOrigins.includes(decoded)) origin = decoded;
  } catch (_) { /* use default */ }

  passport.authenticate('google', {
    session: false,
    failureRedirect: `${origin}/login?error=google_failed`,
  })(req, res, next);
}, googleCallback);

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

// ─── TOTP 2FA ────────────────────────────────────────────────────────────────
// Public: second step of admin login
router.post('/totp/verify-login', totpVerifyLogin);

// Protected admin-only: setup and manage 2FA
router.get('/totp/status',  authenticate, authorize('admin'), totpStatus);
router.get('/totp/setup',   authenticate, authorize('admin'), totpSetup);
router.post('/totp/enable', authenticate, authorize('admin'), totpEnable);
router.post('/totp/disable',authenticate, authorize('admin'), totpDisable);

export default router;
