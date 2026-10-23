import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';

// 確保資料庫目錄存在（支援 Docker volume 持久化掛載）
const dbDir = process.env.DB_DIR || path.join(__dirname, '../../../database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'stocks.db');

// 使用 Node 原生內建 DatabaseSync (零編譯問題，無縫支援跨平台與 NAS)
const db = new DatabaseSync(dbPath);

// 初始化資料庫表格
export function initDatabase(): void {
  // 使用者表格
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 交易紀錄表格
  db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      symbol TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('BUY', 'SELL')),
      price REAL NOT NULL,
      shares REAL NOT NULL,
      date TEXT NOT NULL,
      fee REAL DEFAULT 0,
      tax REAL DEFAULT 0,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // ETF 配息記錄表格
  db.exec(`
    CREATE TABLE IF NOT EXISTS dividend_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      symbol TEXT NOT NULL,
      ex_date TEXT NOT NULL,
      payment_date TEXT NOT NULL,
      amount_per_share REAL NOT NULL,
      shares REAL NOT NULL,
      total_amount REAL NOT NULL,
      is_estimate INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // 複利計算器個人儲存偏好
  db.exec(`
    CREATE TABLE IF NOT EXISTS compound_settings (
      user_id INTEGER PRIMARY KEY,
      frequency TEXT DEFAULT 'MONTHLY',
      periodic_amount REAL DEFAULT 10000,
      initial_amount REAL DEFAULT 0,
      annual_rate REAL DEFAULT 8.0,
      years INTEGER DEFAULT 10,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);
}

export default db;
