import multer from 'multer';
import AppError from '../utils/AppError.js';

const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
const MAX_VIDEO_SIZE = 300 * 1024 * 1024; // 300 MB

const uploadVideo = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (ALLOWED_VIDEO_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError('Only mp4, webm, mov, and avi videos are allowed.', 400), false);
    }
  },
  limits: { fileSize: MAX_VIDEO_SIZE },
});

export default uploadVideo;
