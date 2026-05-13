import { v2 as cloudinary } from 'cloudinary';

// Supports either CLOUDINARY_URL=cloudinary://key:secret@cloud_name
// or the three separate CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET vars
if (process.env.CLOUDINARY_URL) {
  cloudinary.config({ cloudinary_url: process.env.CLOUDINARY_URL });
} else {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

export default cloudinary;
