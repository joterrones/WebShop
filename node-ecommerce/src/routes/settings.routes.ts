import { Router } from 'express';
import * as settingsController from '../controllers/settings.controller';
import { adminOnly } from '../middleware/auth';

const router = Router();

router.get('/whatsapp', settingsController.getWhatsapp);
router.put('/whatsapp', ...adminOnly, settingsController.updateWhatsapp);

export default router;
