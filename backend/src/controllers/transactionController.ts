import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import db from '../config/db';
import { findStock } from '../services/stockListService';

export const getTransactions = (req: AuthRequest, res: Response): void => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ error: '請先登入' });
    return;
  }

  try {
    const rows = db.prepare(`
      SELECT * FROM transactions 
      WHERE user_id = ? 
      ORDER BY date DESC, id DESC
    `).all(userId) as any[];

    // 擴充股票名稱與總投資成本
    const enriched = rows.map(r => {
      const stock = findStock(r.symbol);
      const totalCost = r.type === 'BUY' 
        ? Number((r.price * r.shares + (r.fee || 0) + (r.tax || 0)).toFixed(2))
        : Number((r.price * r.shares - (r.fee || 0) - (r.tax || 0)).toFixed(2));

      return {
        ...r,
        name: stock?.name || r.symbol,
        market: stock?.market || '上市',
        totalCost, // 投資成本欄位
      };
    });

    res.json({ transactions: enriched });
  } catch (error) {
    console.error('getTransactions error:', error);
    res.status(500).json({ error: '讀取交易資料失敗' });
  }
};

export const createTransaction = (req: AuthRequest, res: Response): void => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ error: '請先登入' });
    return;
  }

  const { symbol, type, price, shares, date, fee, tax, notes } = req.body;

  if (!symbol || !symbol.trim()) {
    res.status(400).json({ error: '請輸入有效的股票代號' });
    return;
  }

  if (type !== 'BUY' && type !== 'SELL') {
    res.status(400).json({ error: '交易類型必須為買入(BUY)或賣出(SELL)' });
    return;
  }

  const numPrice = Number(price);
  const numShares = Number(shares);
  const numFee = Number(fee || 0);
  const numTax = Number(tax || 0);

  if (isNaN(numPrice) || numPrice <= 0) {
    res.status(400).json({ error: '買進/賣出價格必須大於 0' });
    return;
  }

  if (isNaN(numShares) || numShares <= 0) {
    res.status(400).json({ error: '交易股數必須大於 0' });
    return;
  }

  if (!date) {
    res.status(400).json({ error: '請選擇交易日期' });
    return;
  }

  const cleanSymbol = symbol.trim().toUpperCase();

  try {
    const stmt = db.prepare(`
      INSERT INTO transactions (user_id, symbol, type, price, shares, date, fee, tax, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      userId,
      cleanSymbol,
      type,
      numPrice,
      numShares,
      date,
      numFee,
      numTax,
      notes || ''
    );

    res.status(201).json({
      message: '交易紀錄新增成功',
      id: result.lastInsertRowid,
    });
  } catch (error) {
    console.error('createTransaction error:', error);
    res.status(500).json({ error: '儲存交易資料失敗' });
  }
};

export const updateTransaction = (req: AuthRequest, res: Response): void => {
  const userId = req.user?.id;
  const id = Number(req.params.id);

  if (!userId || !id) {
    res.status(400).json({ error: '無效的交易識別碼' });
    return;
  }

  const { symbol, type, price, shares, date, fee, tax, notes } = req.body;

  const numPrice = Number(price);
  const numShares = Number(shares);
  const numFee = Number(fee || 0);
  const numTax = Number(tax || 0);

  if (numPrice <= 0 || numShares <= 0) {
    res.status(400).json({ error: '價格與股數必須大於 0' });
    return;
  }

  try {
    const stmt = db.prepare(`
      UPDATE transactions 
      SET symbol = ?, type = ?, price = ?, shares = ?, date = ?, fee = ?, tax = ?, notes = ?
      WHERE id = ? AND user_id = ?
    `);

    const result = stmt.run(
      symbol.trim().toUpperCase(),
      type,
      numPrice,
      numShares,
      date,
      numFee,
      numTax,
      notes || '',
      id,
      userId
    );

    if (result.changes === 0) {
      res.status(404).json({ error: '找不到該筆交易紀錄或無權限修改' });
      return;
    }

    res.json({ message: '交易紀錄更新成功' });
  } catch (error) {
    console.error('updateTransaction error:', error);
    res.status(500).json({ error: '更新失敗' });
  }
};

export const deleteTransaction = (req: AuthRequest, res: Response): void => {
  const userId = req.user?.id;
  const id = Number(req.params.id);

  if (!userId || !id) {
    res.status(400).json({ error: '無效的交易識別碼' });
    return;
  }

  try {
    const stmt = db.prepare('DELETE FROM transactions WHERE id = ? AND user_id = ?');
    const result = stmt.run(id, userId);

    if (result.changes === 0) {
      res.status(404).json({ error: '找不到該筆交易紀錄或無權限刪除' });
      return;
    }

    res.json({ message: '交易已刪除' });
  } catch (error) {
    console.error('deleteTransaction error:', error);
    res.status(500).json({ error: '刪除失敗' });
  }
};
