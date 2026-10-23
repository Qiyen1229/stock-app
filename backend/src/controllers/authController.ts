import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import db from '../config/db';
import { generateToken, AuthRequest } from '../middlewares/authMiddleware';

export const register = (req: Request, res: Response): void => {
  const { username, password } = req.body;

  if (!username || !password || username.trim().length < 3 || password.length < 4) {
    res.status(400).json({ error: '帳號至少需 3 字元，密碼至少需 4 字元' });
    return;
  }

  const cleanUsername = username.trim();

  try {
    const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(cleanUsername);
    if (existing) {
      res.status(400).json({ error: '該帳號已被註冊，請直接登入或使用其他帳號' });
      return;
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const stmt = db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)');
    const result = stmt.run(cleanUsername, passwordHash);
    const userId = Number(result.lastInsertRowid);

    const token = generateToken({ id: userId, username: cleanUsername });

    res.status(201).json({
      message: '註冊成功',
      user: { id: userId, username: cleanUsername },
      token,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: '伺服器內部錯誤，請稍後再試' });
  }
};

export const login = (req: Request, res: Response): void => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: '請輸入使用者帳號與密碼' });
    return;
  }

  try {
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username.trim()) as any;
    if (!user) {
      res.status(401).json({ error: '帳號或密碼錯誤' });
      return;
    }

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      res.status(401).json({ error: '帳號或密碼錯誤' });
      return;
    }

    const token = generateToken({ id: user.id, username: user.username });

    res.json({
      message: '登入成功',
      user: { id: user.id, username: user.username },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: '伺服器內部錯誤，請稍後再試' });
  }
};

export const getMe = (req: AuthRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ error: '未授權' });
    return;
  }
  res.json({ user: req.user });
};
