import { Readable } from 'stream';
import cloudinary from '../config/cloudinary.js';
import AppError from '../utils/AppError.js';

/**
 * POST /api/upload — upload an image to Cloudinary
 */
export const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError('No file uploaded', 400);
    }

    const cloudinaryConfigured =
      process.env.CLOUDINARY_URL ||
      (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME !== '...');
    if (!cloudinaryConfigured) {
      throw new AppError('Image uploads are not configured. Please add Cloudinary credentials to the server .env file.', 503);
    }

    // Upload buffer to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'zimor-india',
          resource_type: 'image',
        },
        (error, result) => {
          if (error) return reject(new AppError(`Cloudinary error: ${error.message}`, 502));
          resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    res.status(200).json({
      status: 'success',
      data: {
        url: result.secure_url,
        publicId: result.public_id,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/upload/video — upload a brand video to Cloudinary
 */
export const uploadVideo = async (req, res, next) => {
  try {
    if (!req.file) throw new AppError('No file uploaded', 400);

    const cloudinaryConfigured =
      process.env.CLOUDINARY_URL ||
      (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME !== '...');
    if (!cloudinaryConfigured) {
      throw new AppError('Uploads are not configured. Please add Cloudinary credentials.', 503);
    }

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'zimor-india/videos',
          resource_type: 'video',
          // Auto-quality and format optimisation
          transformation: [{ quality: 'auto', fetch_format: 'auto' }],
        },
        (error, result) => {
          if (error) return reject(new AppError(`Cloudinary error: ${error.message}`, 502));
          resolve(result);
        }
      );
      // Stream buffer through cloudinary upload stream
      const readable = new Readable();
      readable.push(req.file.buffer);
      readable.push(null);
      readable.pipe(stream);
    });

    res.status(200).json({
      status: 'success',
      data: {
        url: result.secure_url,
        publicId: result.public_id,
      },
    });
  } catch (error) {
    next(error);
  }
};
