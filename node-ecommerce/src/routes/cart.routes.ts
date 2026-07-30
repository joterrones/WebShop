import { Router } from 'express';
import * as cartController from '../controllers/cart.controller';

const router = Router();

router.get('/', cartController.getCart);
router.post('/items', cartController.addItem);
router.patch('/items/:itemId', cartController.updateItem);
router.delete('/items/:itemId', cartController.removeItem);
router.delete('/', cartController.clear);

export default router;
