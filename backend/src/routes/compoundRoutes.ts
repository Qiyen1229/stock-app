import { Router } from 'express';
import {
  computeCompound,
  saveCompoundSettings,
  getCompoundSettings,
} from '../controllers/compoundController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.post('/calculate', computeCompound);
router.get('/settings', authMiddleware, getCompoundSettings);
router.post('/settings', authMiddleware, saveCompoundSettings);

export default router;
