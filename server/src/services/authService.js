import crypto from 'crypto';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import { signToken } from '../utils/jwt.js';
import { sendPasswordResetEmail } from '../utils/email.js';

/**
 * Strip password and sensitive fields from user object before returning.
 */
export const sanitizeUser = (user) => {
  const userObj = user.toObject ? user.toObject() : { ...user };
  delete userObj.password;
  delete userObj.resetPasswordToken;
  delete userObj.resetPasswordExpires;
  delete userObj.__v;
  return userObj;
};

/**
 * Register a new user with name, email, and password.
 * The User model pre-save hook handles bcrypt hashing.
 */
export const registerUser = async (name, email, password) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('Email already registered', 409);
  }

  const user = await User.create({ name, email, password });

  const token = signToken(user._id, user.role);

  return { token, user: sanitizeUser(user) };
};

/**
 * Authenticate a user with email and password.
 * Returns a generic "Invalid credentials" message on failure.
 */
export const authenticateUser = async (email, password) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user || !user.password) {
    throw new AppError('Invalid credentials', 401);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError('Invalid credentials', 401);
  }

  const token = signToken(user._id, user.role);

  return { token, user: sanitizeUser(user) };
};

/**
 * Generate a password reset token, store hashed version on user, send email.
 */
export const forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    // Don't reveal whether email exists
    return;
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
  await user.save({ validateBeforeSave: false });

  await sendPasswordResetEmail(email, resetToken);
};

/**
 * Reset password using token. Validate token, update password, clear reset fields.
 */
export const resetPassword = async (token, newPassword) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppError('Token is invalid or has expired', 400);
  }

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  const jwtToken = signToken(user._id, user.role);

  return { token: jwtToken, user: sanitizeUser(user) };
};

/**
 * Get user profile by ID.
 */
export const getUserProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  return sanitizeUser(user);
};

/**
 * Update user profile (name, phone, addresses).
 */
export const updateUserProfile = async (userId, updates) => {
  const allowedFields = ['name', 'phone', 'addresses'];
  const filteredUpdates = {};

  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      filteredUpdates[field] = updates[field];
    }
  }

  const user = await User.findByIdAndUpdate(userId, filteredUpdates, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return sanitizeUser(user);
};
