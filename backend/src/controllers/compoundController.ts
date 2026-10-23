import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import db from '../config/db';
import {
  calculateCompoundInterest,
  CompoundFrequency,
  CompoundInput,
} from '../services/compoundService';

export const computeCompound = (req: AuthRequest, res: Response): void => {
  const { frequency, periodicAmount, initialAmount, annualRate, years } = req.body;

  const validFrequency: CompoundFrequency = ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'].includes(frequency)
    ? frequency
    : 'MONTHLY';

  const input: CompoundInput = {
    frequency: validFrequency,
    periodicAmount: Math.max(0, Number(periodicAmount) || 0),
    initialAmount: Math.max(0, Number(initialAmount) || 0),
    annualRate: Math.max(0, Number(annualRate) || 0),
    years: Math.min(50, Math.max(1, Number(years) || 10)),
  };

  const result = calculateCompoundInterest(input);
  res.json({ input, result });
};

export const saveCompoundSettings = (req: AuthRequest, res: Response): void => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ error: '請先登入' });
    return;
  }

  const { frequency, periodicAmount, initialAmount, annualRate, years } = req.body;

  try {
    const stmt = db.prepare(`
      INSERT INTO compound_settings (user_id, frequency, periodic_amount, initial_amount, annual_rate, years, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(user_id) DO UPDATE SET
        frequency = excluded.frequency,
        periodic_amount = excluded.periodic_amount,
        initial_amount = excluded.initial_amount,
        annual_rate = excluded.annual_rate,
        years = excluded.years,
        updated_at = CURRENT_TIMESTAMP
    `);

    stmt.run(
      userId,
      frequency || 'MONTHLY',
      Number(periodicAmount) || 10000,
      Number(initialAmount) || 0,
      Number(annualRate) || 8.0,
      Number(years) || 10
    );

    res.json({ message: '複利偏好已儲存' });
  } catch (error) {
    console.error('saveCompoundSettings error:', error);
    res.status(500).json({ error: '儲存失敗' });
  }
};

export const getCompoundSettings = (req: AuthRequest, res: Response): void => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ error: '請先登入' });
    return;
  }

  try {
    const row = db.prepare('SELECT * FROM compound_settings WHERE user_id = ?').get(userId);
    res.json({ settings: row || null });
  } catch (error) {
    console.error('getCompoundSettings error:', error);
    res.status(500).json({ error: '讀取設定失敗' });
  }
};
