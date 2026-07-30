import multer from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { extname, join } from 'path';
import { publicDir } from '../config/env';
import { AppError } from './error-handler';

const uploadDir = join(publicDir, 'images', 'products');

if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const safe = file.originalname
      .toLowerCase()
      .replace(/[^a-z0-9.\-_]/g, '-');
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${extname(safe) || '.jpg'}`);
  },
});

const ALLOWED = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
]);

export const productImageUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 10 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED.has(file.mimetype)) {
      cb(new AppError(400, 'Solo se permiten imágenes (jpg, png, webp, gif, svg)'));
      return;
    }
    cb(null, true);
  },
});

export { uploadDir };
