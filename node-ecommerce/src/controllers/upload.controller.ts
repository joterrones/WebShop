import { Request, Response, NextFunction } from 'express';
import { toPublicUrl } from '../utils/media';

/** POST /api/products/upload — recibe multipart field "images" */
export async function uploadImages(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const files = req.files as Express.Multer.File[] | undefined;
    if (!files || files.length === 0) {
      res.status(400).json({ error: 'No se enviaron imágenes' });
      return;
    }

    const images = files.map((file, index) => {
      const path = `/images/products/${file.filename}`;
      return {
        url: path,
        publicUrl: toPublicUrl(path),
        filename: file.filename,
        sortOrder: index,
        isPrimary: index === 0,
      };
    });

    res.status(201).json({ images });
  } catch (err) {
    next(err);
  }
}
