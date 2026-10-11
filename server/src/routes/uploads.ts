
import { Router, Request, Response } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config';
import { authenticateUser, requireAdmin } from '../middleware/auth';

export const uploadsRouter = Router();

// Configure Cloudinary from the server-side environment variable.
if (config.cloudinaryUrl) {
  const cloudinaryUrl = new URL(config.cloudinaryUrl);

  cloudinary.config({
    cloud_name: cloudinaryUrl.hostname,
    api_key: decodeURIComponent(cloudinaryUrl.username),
    api_secret: decodeURIComponent(cloudinaryUrl.password),
    secure: true,
  });
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB maximum
    files: 1,
  },
  fileFilter: (_req, file, callback) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      callback(new Error('Only JPEG, PNG, WebP, and GIF images are allowed.'));
      return;
    }

    callback(null, true);
  },
});

uploadsRouter.post(
  '/uploads/image',
  authenticateUser,
  requireAdmin,
  (req: Request, res: Response) => {
    if (!config.cloudinaryUrl) {
      res.status(500).json({ error: 'Cloudinary is not configured.' });
      return;
    }

    upload.single('image')(req, res, (uploadError) => {
      if (uploadError) {
        res.status(400).json({
          error: uploadError instanceof Error
            ? uploadError.message
            : 'Image upload failed.',
        });
        return;
      }

      if (!req.file) {
        res.status(400).json({ error: 'Please select an image.' });
        return;
      }

      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'kawai-makes/products',
          resource_type: 'image',
        },
        (error, result) => {
          if (error || !result) {
            console.error('Cloudinary upload failed:', error?.message);
            res.status(502).json({ error: 'Could not upload image.' });
            return;
          }

          res.status(200).json({
            success: true,
            imageUrl: result.secure_url,
            publicId: result.public_id,
          });
        }
      );

      stream.end(req.file.buffer);
    });
  }
);
