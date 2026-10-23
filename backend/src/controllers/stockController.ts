import { Request, Response } from 'express';
import { searchStocks as searchFn, findStock } from '../services/stockListService';
import { getQuote, getRealHistoricalData } from '../services/quoteService';
import { getEtfDividendInfo } from '../services/etfDividendService';

export const searchStockList = (req: Request, res: Response): void => {
  const query = (req.query.q as string) || '';
  const list = searchFn(query);
  res.json({ results: list });
};

export const getStockDetail = async (req: Request, res: Response): Promise<void> => {
  const symbol = req.params.symbol?.toUpperCase();
  if (!symbol) {
    res.status(400).json({ error: '請提供股票代號' });
    return;
  }

  try {
    const meta = findStock(symbol);
    const quote = await getQuote(symbol);
    const dividendInfo = getEtfDividendInfo(symbol);

    res.json({
      stock: {
        symbol,
        name: meta?.name || symbol,
        market: meta?.market || '上市',
        industry: meta?.industry || '綜合',
        quote,
        dividendInfo,
      },
    });
  } catch (error) {
    console.error('getStockDetail error:', error);
    res.status(500).json({ error: '獲取個股資料失敗' });
  }
};

export const getStockHistory = async (req: Request, res: Response): Promise<void> => {
  const symbol = req.params.symbol?.toUpperCase();
  const timeframe = (req.query.timeframe as string) || '1M';

  if (!symbol) {
    res.status(400).json({ error: '請提供股票代號' });
    return;
  }

  try {
    const history = await getRealHistoricalData(symbol, timeframe);
    res.json({ symbol, timeframe, history });
  } catch (error) {
    console.error('getStockHistory error:', error);
    res.status(500).json({ error: '獲取歷史線圖資料失敗' });
  }
};
