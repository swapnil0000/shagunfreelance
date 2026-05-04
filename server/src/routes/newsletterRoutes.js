import { Router } from 'express';
import { body } from 'express-validator';
import validate from '../middleware/validate.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { subscribe, getAllSubscribers } from '../controllers/newsletterController.js';

const router = Router();

// POST /api/newsletter/subscribe — public
router.post(
  '/subscribe',
  [
    body('email')
      .trim()
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail(),
  ],
  validate,
  subscribe
);

// GET /api/newsletter — admin only
router.get('/', authenticate, authorize('admin'), getAllSubscribers);

export default router;
