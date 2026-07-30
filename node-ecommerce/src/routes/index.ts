import { Router } from 'express';
import authRoutes from './auth.routes';
import categoriesRoutes from './categories.routes';
import productsRoutes from './products.routes';
import attributesRoutes from './attributes.routes';
import ordersRoutes from './orders.routes';
import settingsRoutes from './settings.routes';
import cartRoutes from './cart.routes';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'node-ecommerce' });
});

router.use('/auth', authRoutes);
router.use('/categories', categoriesRoutes);
router.use('/products', productsRoutes);
router.use('/attributes', attributesRoutes);
router.use('/orders', ordersRoutes);
router.use('/settings', settingsRoutes);
router.use('/cart', cartRoutes);

export default router;
