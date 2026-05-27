import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import {
  registerUser,
  authenticateUser,
  verifyTotpLogin,
  forgotPassword,
  resetPassword,
  getUserProfile,
  updateUserProfile,
  sanitizeUser,
} from '../services/authService.js';
import { signToken } from '../utils/jwt.js';
import User from '../models/User.js';

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

// ─── TOTP 2FA ────────────────────────────────────────────────────────────────

/**
 * POST /api/auth/totp/verify-login
 * Second step of login for admins with 2FA enabled.
 */
export const totpVerifyLogin = async (req, res, next) => {
  try {
    const { tempToken, code } = req.body;
    const result = await verifyTotpLogin(tempToken, code);
    res.status(200).json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/totp/setup  (admin only, authenticated)
 * Generates a new TOTP secret and returns the QR code data URL.
 * Does NOT enable 2FA yet — admin must confirm with a valid code first.
 */
export const totpSetup = async (req, res, next) => {
  try {
    const secret = speakeasy.generateSecret({
      name:   `ZimorAdmin (${req.user.email})`,
      length: 20,
    });

    // Store temp secret on user (not enabled yet)
    await User.findByIdAndUpdate(req.user._id, { totpSecret: secret.base32 });

    const qrDataUrl = await QRCode.toDataURL(secret.otpauth_url);

    res.status(200).json({
      status: 'success',
      data:   { qrDataUrl, secret: secret.base32 },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/totp/enable  (admin only, authenticated)
 * Verifies the TOTP code against stored secret, then enables 2FA.
 */
export const totpEnable = async (req, res, next) => {
  try {
    const { code } = req.body;
    const user = await User.findById(req.user._id).select('+totpSecret');

    if (!user.totpSecret) {
      return res.status(400).json({ status: 'error', message: 'Run /totp/setup first' });
    }

    const valid = speakeasy.totp.verify({
      secret:   user.totpSecret,
      encoding: 'base32',
      token:    code,
      window:   1,
    });

    if (!valid) {
      return res.status(400).json({ status: 'error', message: 'Invalid authenticator code' });
    }

    user.totpEnabled = true;
    await user.save();

    res.status(200).json({ status: 'success', message: '2FA enabled successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/totp/disable  (admin only, authenticated)
 * Verifies TOTP code then disables 2FA.
 */
export const totpDisable = async (req, res, next) => {
  try {
    const { code } = req.body;
    const user = await User.findById(req.user._id).select('+totpSecret');

    if (!user.totpEnabled) {
      return res.status(400).json({ status: 'error', message: '2FA is not enabled' });
    }

    const valid = speakeasy.totp.verify({
      secret:   user.totpSecret,
      encoding: 'base32',
      token:    code,
      window:   1,
    });

    if (!valid) {
      return res.status(400).json({ status: 'error', message: 'Invalid authenticator code' });
    }

    await User.findByIdAndUpdate(req.user._id, {
      totpEnabled: false,
      totpSecret:  null,
    });

    res.status(200).json({ status: 'success', message: '2FA disabled' });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/totp/status  (admin only, authenticated)
 */
export const totpStatus = async (req, res) => {
  res.status(200).json({
    status: 'success',
    data:   { totpEnabled: req.user.totpEnabled || false },
  });
};
