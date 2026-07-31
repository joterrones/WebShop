import { Router } from 'express';
import * as ordersController from '../controllers/orders.controller';
import { adminOnly } from '../middleware/auth';

const router = Router();

/** Checkout público: crear pedido sin autenticación */
router.post('/', ordersController.create);

/** Administración de pedidos: solo admin */
router.get('/', ...adminOnly, ordersController.list);
router.get('/:id', ...adminOnly, ordersController.getById);
router.patch('/:id/status', ...adminOnly, ordersController.updateStatus);
router.patch('/:id/shipping', ...adminOnly, ordersController.updateShipping);
router.put('/:id/discount', ...adminOnly, ordersController.setDiscount);
router.post('/:id/adjustments', ...adminOnly, ordersController.applyAdjustment);

export default router;
