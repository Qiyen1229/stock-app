import { Router } from 'express';
import { getPortfolio } from '../controllers/portfolioController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', authMiddleware, getPortfolio);

export default router;
