import { Router } from 'express';
import * as categoriesController from '../controllers/categories.controller';

const router = Router();

router.get('/', categoriesController.list);
router.get('/:slug/products', categoriesController.getProductsBySlug);

export default router;
