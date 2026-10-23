import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import db from '../config/db';
import { findStock } from '../services/stockListService';
import { getBatchQuotes } from '../services/quoteService';

export interface HoldingItem {
  symbol: string;
  name: string;
  market: '上市' | '上櫃' | 'ETF';
  industry?: string;
  shares: number;             // 總持有股數
  avgCost: number;            // 成本均價
  totalCost: number;          // 投資成本 (總投入成本)
  currentPrice: number;       // 當前股價
  marketValue: number;        // 當前市值
  unrealizedProfit: number;   // 未實現損益
  profitRate: number;         // 損益率 (%)
  todayChange: number;        // 今日漲跌
  todayChangePercent: number; // 今日漲跌幅 (%)
  todayProfit: number;        // 今日損益
  portfolioRatio: number;     // 資產佔比 (%)
  updatedAt: string;          // 行情更新時間
  status: string;             // 行情狀態 (即時 / 延遲 / 最後交易價格)
}

export const getPortfolio = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ error: '請先登入' });
    return;
  }

  try {
    // 獲取該使用者所有交易紀錄
    const transactions = db.prepare(`
      SELECT * FROM transactions WHERE user_id = ? ORDER BY date ASC, id ASC
    `).all(userId) as any[];

    // 依股票代號聚合計算加權平均成本與總持股數
    const stockMap: Record<string, { totalShares: number; totalCost: number }> = {};

    for (const tx of transactions) {
      const sym = tx.symbol.toUpperCase();
      if (!stockMap[sym]) {
        stockMap[sym] = { totalShares: 0, totalCost: 0 };
      }

      if (tx.type === 'BUY') {
        const cost = tx.price * tx.shares + (tx.fee || 0) + (tx.tax || 0);
        stockMap[sym].totalShares += tx.shares;
        stockMap[sym].totalCost += cost;
      } else if (tx.type === 'SELL') {
        // 賣出時依目前平均成本扣除對應比例成本
        if (stockMap[sym].totalShares > 0) {
          const currentAvg = stockMap[sym].totalCost / stockMap[sym].totalShares;
          stockMap[sym].totalShares = Math.max(0, stockMap[sym].totalShares - tx.shares);
          stockMap[sym].totalCost = Math.max(0, stockMap[sym].totalShares * currentAvg);
        }
      }
    }

    // 篩選出仍有持股的標的
    const activeSymbols = Object.keys(stockMap).filter(sym => stockMap[sym].totalShares > 0);
    const quotes = await getBatchQuotes(activeSymbols);

    let totalPortfolioCost = 0;
    let totalPortfolioMarketValue = 0;
    let totalTodayProfit = 0;
    let stockCount = 0;
    let etfCount = 0;

    const rawHoldings = activeSymbols.map(sym => {
      const { totalShares, totalCost } = stockMap[sym];
      const stockMeta = findStock(sym);
      const quote = quotes[sym] || {
        price: stockMeta?.defaultPrice || 100,
        change: 0,
        changePercent: 0,
        updatedAt: '剛剛',
        status: '最後交易價格',
      };

      const avgCost = totalShares > 0 ? Number((totalCost / totalShares).toFixed(2)) : 0;
      const currentPrice = quote.price;
      const marketValue = Number((currentPrice * totalShares).toFixed(2));
      const unrealizedProfit = Number((marketValue - totalCost).toFixed(2));
      const profitRate = totalCost > 0 ? Number(((unrealizedProfit / totalCost) * 100).toFixed(2)) : 0;
      const todayProfit = Number((quote.change * totalShares).toFixed(2));

      totalPortfolioCost += totalCost;
      totalPortfolioMarketValue += marketValue;
      totalTodayProfit += todayProfit;

      const market = stockMeta?.market || '上市';
      if (market === 'ETF') {
        etfCount++;
      } else {
        stockCount++;
      }

      return {
        symbol: sym,
        name: stockMeta?.name || sym,
        market,
        industry: stockMeta?.industry,
        shares: totalShares,
        avgCost,
        totalCost: Number(totalCost.toFixed(2)), // 投資成本
        currentPrice,
        marketValue,
        unrealizedProfit,
        profitRate,
        todayChange: quote.change,
        todayChangePercent: quote.changePercent,
        todayProfit,
        portfolioRatio: 0, // 下一步計算
        updatedAt: quote.updatedAt,
        status: quote.status,
      };
    });

    // 計算各檔在總投資市值中的佔比
    const holdings: HoldingItem[] = rawHoldings.map(h => ({
      ...h,
      portfolioRatio: totalPortfolioMarketValue > 0
        ? Number(((h.marketValue / totalPortfolioMarketValue) * 100).toFixed(1))
        : 0,
    }));

    // 按市值排序
    holdings.sort((a, b) => b.marketValue - a.marketValue);

    const totalUnrealizedProfit = Number((totalPortfolioMarketValue - totalPortfolioCost).toFixed(2));
    const totalProfitRate = totalPortfolioCost > 0
      ? Number(((totalUnrealizedProfit / totalPortfolioCost) * 100).toFixed(2))
      : 0;

    // 計算台股 vs ETF 資產配置比例
    const etfValue = holdings.filter(h => h.market === 'ETF').reduce((sum, h) => sum + h.marketValue, 0);
    const stockValue = totalPortfolioMarketValue - etfValue;

    res.json({
      summary: {
        totalCost: Number(totalPortfolioCost.toFixed(2)),             // 總投入成本 (投資成本)
        totalMarketValue: Number(totalPortfolioMarketValue.toFixed(2)), // 目前總市值 (總資產)
        totalProfit: totalUnrealizedProfit,                          // 總損益
        totalProfitRate: totalProfitRate,                            // 總損益率 (%)
        todayProfit: Number(totalTodayProfit.toFixed(2)),            // 今日總損益
        stockCount,                                                  // 股票持倉數
        etfCount,                                                    // ETF 持倉數
        allocation: [
          {
            name: '個股',
            value: Number(stockValue.toFixed(2)),
            ratio: totalPortfolioMarketValue > 0 ? Number(((stockValue / totalPortfolioMarketValue) * 100).toFixed(1)) : 0,
          },
          {
            name: 'ETF',
            value: Number(etfValue.toFixed(2)),
            ratio: totalPortfolioMarketValue > 0 ? Number(((etfValue / totalPortfolioMarketValue) * 100).toFixed(1)) : 0,
          },
        ],
      },
      holdings,
    });
  } catch (error) {
    console.error('getPortfolio error:', error);
    res.status(500).json({ error: '計算資產與持倉失敗' });
  }
};
