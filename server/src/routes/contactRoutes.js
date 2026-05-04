import { Router } from 'express';
import { body } from 'express-validator';
import validate from '../middleware/validate.js';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  createMessage,
  getAllMessages,
  markAsRead,
} from '../controllers/contactController.js';

const router = Router();

// POST /api/contact — public
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email')
      .trim()
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail(),
    body('subject').trim().notEmpty().withMessage('Subject is required'),
    body('message').trim().notEmpty().withMessage('Message is required'),
  ],
  validate,
  createMessage
);

// GET /api/contact — admin only
router.get('/', authenticate, authorize('admin'), getAllMessages);

// PUT /api/contact/:id/read — admin only
router.put('/:id/read', authenticate, authorize('admin'), markAsRead);

export default router;
