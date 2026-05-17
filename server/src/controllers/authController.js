import {
  registerUser,
  authenticateUser,
  forgotPassword,
  resetPassword,
  getUserProfile,
  updateUserProfile,
  sanitizeUser,
} from '../services/authService.js';
import { signToken } from '../utils/jwt.js';

/**
 * POST /api/auth/register
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const result = await registerUser(name, email, password);

    res.status(201).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authenticateUser(email, password);

    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/google/callback
 * Passport Google OAuth callback handler.
 */
export const googleCallback = (req, res) => {
  const token = signToken(req.user._id, req.user.role);
  const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',').map(u => u.trim());
  let clientUrl = allowedOrigins[0];
  try {
    const decoded = Buffer.from(req.query.state || '', 'base64').toString();
    if (allowedOrigins.includes(decoded)) clientUrl = decoded;
  } catch (_) { /* use default */ }
  res.redirect(`${clientUrl}/login?token=${token}`);
};

/**
 * POST /api/auth/forgot-password
 */
export const forgotPasswordHandler = async (req, res, next) => {
  try {
    const { email } = req.body;
    await forgotPassword(email);

    // Always return success to prevent email enumeration
    res.status(200).json({
      status: 'success',
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/reset-password/:token
 */
export const resetPasswordHandler = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    const result = await resetPassword(token, password);

    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/me
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await getUserProfile(req.user._id);

    res.status(200).json({
      status: 'success',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/auth/me
 */
export const updateMe = async (req, res, next) => {
  try {
    const user = await updateUserProfile(req.user._id, req.body);

    res.status(200).json({
      status: 'success',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};
