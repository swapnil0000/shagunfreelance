import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import { uploadImage } from '../controllers/uploadController.js';

const router = Router();

// POST /api/upload — admin only, single image upload
router.post(
  '/',
  authenticate,
  authorize('admin'),
  upload.single('image'),
  uploadImage
);

export default router;
