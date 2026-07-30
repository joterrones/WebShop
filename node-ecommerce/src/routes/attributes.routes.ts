import { Router } from 'express';
import * as attributesController from '../controllers/attributes.controller';
import { adminOnly } from '../middleware/auth';

const router = Router();

router.get('/', attributesController.list);
router.post('/', ...adminOnly, attributesController.create);

export default router;
