import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import uploadVideo from '../middleware/uploadVideo.js';
import { uploadImage, uploadVideo as uploadVideoHandler } from '../controllers/uploadController.js';

const router = Router();

// POST /api/upload — admin only, single image upload
router.post(
  '/',
  authenticate,
  authorize('admin'),
  upload.single('image'),
  uploadImage
);

// POST /api/upload/video — admin only, single video upload
router.post(
  '/video',
  authenticate,
  authorize('admin'),
  uploadVideo.single('video'),
  uploadVideoHandler
);

export default router;
