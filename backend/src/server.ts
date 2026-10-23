import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { initDatabase } from './config/db';

import authRoutes from './routes/authRoutes';
import portfolioRoutes from './routes/portfolioRoutes';
import transactionRoutes from './routes/transactionRoutes';
import dividendRoutes from './routes/dividendRoutes';
import stockRoutes from './routes/stockRoutes';
import compoundRoutes from './routes/compoundRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8889;

// 初始化資料庫
initDatabase();

// 中介層
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// API 路由分層
app.use('/api/auth', authRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/dividends', dividendRoutes);
app.use('/api/stocks', stockRoutes);
app.use('/api/compound', compoundRoutes);

// 健康檢查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// 若有前端靜態檔案則一併託管 (適合 Docker 單一容器部署)
const frontendDist = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendDist));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(frontendDist, 'index.html'), (err) => {
    if (err) {
      res.status(404).send('Stock App API Server running.');
    }
  });
});

app.listen(PORT, () => {
  console.log(`[Stock App Backend] 伺服器啟動於 http://localhost:${PORT}`);
});
