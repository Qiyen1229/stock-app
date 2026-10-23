import { Router } from 'express';
import { getDividendCenter } from '../controllers/dividendController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/', getDividendCenter);

export default router;
