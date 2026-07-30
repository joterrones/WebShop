import { Router } from 'express';
import * as productsController from '../controllers/products.controller';
import * as uploadController from '../controllers/upload.controller';
import { adminOnly } from '../middleware/auth';
import { productImageUpload } from '../middleware/upload';

const router = Router();

router.get('/', productsController.list);
router.get('/:id', productsController.getById);

router.post(
  '/upload',
  ...adminOnly,
  productImageUpload.array('images', 10),
  uploadController.uploadImages,
);
router.post('/', ...adminOnly, productsController.create);
router.put('/:id', ...adminOnly, productsController.update);
router.delete('/:id', ...adminOnly, productsController.remove);

export default router;
