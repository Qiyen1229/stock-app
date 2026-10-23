import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import db from '../config/db';
import { getEtfDividendInfo, ETF_DIVIDEND_DATABASE } from '../services/etfDividendService';

export const getDividendCenter = (req: AuthRequest, res: Response): void => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ error: '請先登入' });
    return;
  }

  try {
    // 找出使用者目前持有的所有標的與股數
    const transactions = db.prepare(`
      SELECT symbol, type, shares FROM transactions WHERE user_id = ?
    `).all(userId) as any[];

    const sharesMap: Record<string, number> = {};
    for (const tx of transactions) {
      const sym = tx.symbol.toUpperCase();
      sharesMap[sym] = (sharesMap[sym] || 0) + (tx.type === 'BUY' ? tx.shares : -tx.shares);
    }

    const heldEtfSymbols = Object.keys(sharesMap).filter(
      sym => sharesMap[sym] > 0 && !!ETF_DIVIDEND_DATABASE[sym]
    );

    // 建立持有 ETF 的配息概要卡片
    let totalEstimatedAnnual = 0;
    const etfCards = heldEtfSymbols.map(sym => {
      const info = ETF_DIVIDEND_DATABASE[sym];
      const shares = sharesMap[sym];
      const estimatedPayout = Math.round(shares * info.amountPerShare);
      
      let frequencyMultiplier = 1;
      if (info.frequency === '月配') frequencyMultiplier = 12;
      else if (info.frequency === '季配') frequencyMultiplier = 4;
      else if (info.frequency === '半年配') frequencyMultiplier = 2;

      totalEstimatedAnnual += estimatedPayout * frequencyMultiplier;

      return {
        symbol: sym,
        name: info.name,
        frequency: info.frequency,
        shares,
        amountPerShare: info.amountPerShare,
        estimatedPayout,
        nextExDate: info.lastExDate,
        nextPaymentDate: info.lastPaymentDate,
        yieldRate: info.estimatedYield,
      };
    });

    // 取得使用者過去的實際配息紀錄
    const records = db.prepare(`
      SELECT * FROM dividend_records WHERE user_id = ? ORDER BY payment_date DESC
    `).all(userId) as any[];

    // 統計月度配息金額 (最近 12 個月)
    const monthlyStats: Record<string, number> = {};
    const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    months.forEach(m => { monthlyStats[m] = 0; });

    // 模擬或累計歷史記錄到各月份
    records.forEach(r => {
      const parts = r.payment_date.split('/');
      if (parts.length >= 2) {
        const monthIndex = parseInt(parts[1], 10) - 1;
        if (monthIndex >= 0 && monthIndex < 12) {
          monthlyStats[months[monthIndex]] += r.total_amount;
        }
      }
    });

    // 若使用者持有 ETF 但尚無手動歷史入帳，系統提供預估年度月份分佈
    if (records.length === 0 && etfCards.length > 0) {
      etfCards.forEach(card => {
        if (card.frequency === '月配') {
          months.forEach(m => { monthlyStats[m] += card.estimatedPayout; });
        } else if (card.frequency === '季配') {
          ['3月', '6月', '9月', '12月'].forEach(m => { monthlyStats[m] += card.estimatedPayout; });
        } else if (card.frequency === '半年配') {
          ['1月', '7月'].forEach(m => { monthlyStats[m] += card.estimatedPayout; });
        }
      });
    }

    const currentYearTotal = Object.values(monthlyStats).reduce((a, b) => a + b, 0);

    res.json({
      summary: {
        totalEstimatedAnnual,
        currentYearTotal,
        heldEtfCount: etfCards.length,
      },
      etfCards,
      records,
      monthlyDistribution: months.map(m => ({ month: m, amount: monthlyStats[m] })),
    });
  } catch (error) {
    console.error('getDividendCenter error:', error);
    res.status(500).json({ error: '獲取配息資料失敗' });
  }
};
