import { Router } from 'express';
import {
  searchStockList,
  getStockDetail,
  getStockHistory,
} from '../controllers/stockController';

const router = Router();

router.get('/search', searchStockList);
router.get('/:symbol', getStockDetail);
router.get('/:symbol/history', getStockHistory);

export default router;
