import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { getSetting, upsertSetting } from '../controllers/settingsController.js';

const router = Router();

router.get('/:key', getSetting);
router.put('/:key', authenticate, authorize('admin'), upsertSetting);

export default router;
