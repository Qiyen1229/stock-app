import React, { useState, useEffect } from 'react';
import { ArrowLeftRight, Plus, Trash2, Edit3, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { request } from '../api/client';
import { usePortfolio } from '../contexts/PortfolioContext';
import { formatCurrency, formatStockPrice, formatShares } from '../utils/formatters';

interface TransactionItem {
  id: number;
  symbol: string;
  name: string;
  market: string;
  type: 'BUY' | 'SELL';
  price: number;
  shares: number;
  date: string;
  fee: number;
  tax: number;
  notes?: string;
  totalCost: number; // 投資成本
}

interface TransactionsPageProps {
  onOpenNewTransaction: () => void;
  onEditTransaction: (tx: any) => void;
}

export const TransactionsPage: React.FC<TransactionsPageProps> = ({
  onOpenNewTransaction,
  onEditTransaction,
}) => {
  const { refreshPortfolio } = usePortfolio();
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<'ALL' | 'BUY' | 'SELL'>('ALL');

  const loadTransactions = async () => {
    setIsLoading(true);
    try {
      const res = await request<{ transactions: TransactionItem[] }>('/transactions');
      setTransactions(res.transactions || []);
    } catch (err) {
      console.error('載入交易明細出錯:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('確定要刪除這筆交易紀錄嗎？')) return;
    try {
      await request(`/transactions/${id}`, { method: 'DELETE' });
      await loadTransactions();
      await refreshPortfolio(true);
    } catch (err: any) {
      alert(err.message || '刪除失敗');
    }
  };

  const filtered = transactions.filter((t) => {
    if (filterType === 'ALL') return true;
    return t.type === filterType;
  });

  return (
    <div className="transactions-page">
      {/* 頂部標題 */}
      <div className="tx-header-row">
        <div className="title-box">
          <ArrowLeftRight size={22} className="brand-accent" />
          <h1 className="page-title">交易紀錄明細</h1>
          <span className="count-pill">{filtered.length} 筆</span>
        </div>

        <button onClick={onOpenNewTransaction} className="touch-btn touch-btn-primary add-btn">
          <Plus size={16} />
          <span>新增交易</span>
        </button>
      </div>

      {/* 類型切換標籤 */}
      <div className="tx-filter-bar glass-card">
        <button
          type="button"
          className={`tx-filter-btn ${filterType === 'ALL' ? 'active' : ''}`}
          onClick={() => setFilterType('ALL')}
        >
          全部 ({transactions.length})
        </button>
        <button
          type="button"
          className={`tx-filter-btn ${filterType === 'BUY' ? 'active' : ''}`}
          onClick={() => setFilterType('BUY')}
        >
          買入明細 ({transactions.filter((t) => t.type === 'BUY').length})
        </button>
        <button
          type="button"
          className={`tx-filter-btn ${filterType === 'SELL' ? 'active' : ''}`}
          onClick={() => setFilterType('SELL')}
        >
          賣出明細 ({transactions.filter((t) => t.type === 'SELL').length})
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-tx glass-card">
          <p>尚無相關交易紀錄</p>
        </div>
      ) : (
        <>
          {/* 手機版卡片列表 */}
          <div className="mobile-tx-list">
            {filtered.map((t) => {
              const isBuy = t.type === 'BUY';
              return (
                <div key={t.id} className="tx-card glass-card">
                  <div className="tx-card-head">
                    <div className="tx-sym-group">
                      <span className={`type-badge ${isBuy ? 'buy' : 'sell'}`}>
                        {isBuy ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                        {isBuy ? '買進' : '賣出'}
                      </span>
                      <span className="sym-tag">{t.symbol}</span>
                      <span className="stock-name nowrap">{t.name}</span>
                    </div>

                    <div className="tx-actions">
                      <button 
                        onClick={() => onEditTransaction(t)} 
                        className="icon-action-btn"
                        title="編輯"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button 
                        onClick={() => handleDelete(t.id)} 
                        className="icon-action-btn delete"
                        title="刪除"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <div className="tx-card-grid">
                    <div className="tx-cell">
                      <span className="cell-lbl">成交單價</span>
                      <span className="cell-val nowrap">{formatStockPrice(t.price)}</span>
                    </div>

                    <div className="tx-cell right">
                      <span className="cell-lbl">交易股數</span>
                      <span className="cell-val nowrap">{formatShares(t.shares)}</span>
                    </div>

                    <div className="tx-cell">
                      <span className="cell-lbl">投資成本 (含費用)</span>
                      <span className="cell-val font-bold nowrap">{formatCurrency(t.totalCost)}</span>
                    </div>

                    <div className="tx-cell right">
                      <span className="cell-lbl">交易日期</span>
                      <span className="cell-val date-val nowrap">{t.date}</span>
                    </div>
                  </div>

                  {(t.fee > 0 || t.tax > 0 || t.notes) && (
                    <div className="tx-card-footer">
                      {(t.fee > 0 || t.tax > 0) && (
                        <span className="fee-text nowrap">
                          費用: 手續費 NT$ {t.fee} / 稅 NT$ {t.tax}
                        </span>
                      )}
                      {t.notes && <span className="notes-text">備註: {t.notes}</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* 桌面版表格 */}
          <div className="desktop-tx-table-wrap glass-card">
            <table className="desktop-table">
              <colgroup>
                <col style={{ width: '10%' }} />
                <col style={{ width: '6%' }} />
                <col style={{ width: '8%' }} />
                <col style={{ width: '13%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '8%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '8%' }} />
                <col style={{ width: '8%' }} />
                <col style={{ width: '9%' }} />
                <col style={{ width: '8%' }} />
              </colgroup>
              <thead>
                <tr>
                  <th className="col-left">日期</th>
                  <th className="col-center">類別</th>
                  <th className="col-left">標的代號</th>
                  <th className="col-left">股票名稱</th>
                  <th className="col-right">成交價格</th>
                  <th className="col-right">股數</th>
                  <th className="col-right">投資成本 (金額)</th>
                  <th className="col-right">手續費</th>
                  <th className="col-right">交易稅</th>
                  <th className="col-left">備註</th>
                  <th className="col-center">操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => {
                  const isBuy = t.type === 'BUY';
                  return (
                    <tr key={t.id}>
                      <td className="col-left">{t.date}</td>
                      <td className="col-center">
                        <span className={`type-badge-sm ${isBuy ? 'buy' : 'sell'}`}>
                          {isBuy ? '買進' : '賣出'}
                        </span>
                      </td>
                      <td className="col-left font-bold">{t.symbol}</td>
                      <td className="col-left">{t.name}</td>
                      <td className="col-right tabular-nums">{formatStockPrice(t.price)}</td>
                      <td className="col-right tabular-nums">{formatShares(t.shares)}</td>
                      <td className="col-right tabular-nums font-bold">{formatCurrency(t.totalCost)}</td>
                      <td className="col-right tabular-nums">NT$ {t.fee}</td>
                      <td className="col-right tabular-nums">NT$ {t.tax}</td>
                      <td className="col-left notes-cell">{t.notes || '-'}</td>
                      <td className="col-center">
                        <div className="table-actions">
                          <button onClick={() => onEditTransaction(t)} className="action-link">
                            編輯
                          </button>
                          <button onClick={() => handleDelete(t.id)} className="action-link delete">
                            刪除
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      <style>{`
        .transactions-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          width: 100%;
        }

        .brand-accent {
          color: var(--brand-primary);
        }

        .tx-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .title-box {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .page-title {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-main);
        }

        .count-pill {
          background: var(--bg-surface-elevated);
          color: var(--text-secondary);
          font-size: 12px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 9999px;
        }

        .add-btn {
          height: 38px;
          padding: 0 14px;
          font-size: 13px;
          gap: 6px;
        }

        .tx-filter-bar {
          display: flex;
          padding: 6px;
          gap: 6px;
        }

        .tx-filter-btn {
          flex: 1;
          border: none;
          background: none;
          color: var(--text-secondary);
          font-size: 13px;
          font-weight: 600;
          padding: 8px 0;
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .tx-filter-btn.active {
          background: var(--bg-surface-elevated);
          color: var(--brand-primary);
          font-weight: 700;
        }

        /* 手機版卡片 */
        .mobile-tx-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .desktop-tx-table-wrap {
          display: none;
        }

        @media (min-width: 1024px) {
          .mobile-tx-list {
            display: none;
          }
          .desktop-tx-table-wrap {
            display: block;
            overflow-x: auto;
          }
        }

        .tx-card {
          padding: 14px;
        }

        .tx-card-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 8px;
          border-bottom: 1px solid var(--border-subtle);
          margin-bottom: 10px;
        }

        .tx-sym-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .type-badge {
          display: flex;
          align-items: center;
          gap: 3px;
          font-size: 12px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: var(--radius-sm);
        }

        .type-badge.buy {
          background: var(--tw-up-bg);
          color: var(--tw-up);
        }

        .type-badge.sell {
          background: var(--tw-down-bg);
          color: var(--tw-down);
        }

        .sym-tag {
          font-weight: 700;
          font-size: 13px;
          background: var(--bg-surface-elevated);
          padding: 2px 6px;
          border-radius: var(--radius-sm);
        }

        .stock-name {
          font-weight: 600;
          font-size: 14px;
        }

        .tx-actions {
          display: flex;
          gap: 6px;
        }

        .icon-action-btn {
          width: 30px;
          height: 30px;
          border-radius: var(--radius-sm);
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-subtle);
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .icon-action-btn.delete {
          color: var(--tw-up);
        }

        .tx-card-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          row-gap: 8px;
        }

        .tx-cell {
          display: flex;
          flex-direction: column;
        }

        .tx-cell.right {
          align-items: flex-end;
          text-align: right;
        }

        .cell-lbl {
          font-size: 11px;
          color: var(--text-muted);
          margin-bottom: 2px;
        }

        .cell-val {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-main);
        }

        .date-val {
          color: var(--text-secondary);
        }

        .tx-card-footer {
          margin-top: 8px;
          padding-top: 8px;
          border-top: 1px solid var(--border-subtle);
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-size: 11px;
          color: var(--text-muted);
        }

        /* 桌面表格 (極致對齊) */
        .desktop-table {
          width: 100%;
          table-layout: fixed;
          border-collapse: collapse;
          font-size: 14px;
          min-width: 980px;
        }

        .desktop-table th {
          padding: 14px 10px;
          background: var(--bg-surface-elevated);
          color: var(--text-secondary);
          font-weight: 600;
          font-size: 13px;
          border-bottom: 1px solid var(--border-subtle);
          white-space: nowrap;
        }

        .desktop-table td {
          padding: 14px 10px;
          border-bottom: 1px solid var(--border-subtle);
          vertical-align: middle;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .desktop-table th.col-left, .desktop-table td.col-left {
          text-align: left !important;
        }

        .desktop-table th.col-center, .desktop-table td.col-center {
          text-align: center !important;
        }

        .desktop-table th.col-right, .desktop-table td.col-right {
          text-align: right !important;
        }

        .type-badge-sm {
          font-size: 11px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .type-badge-sm.buy {
          background: var(--tw-up-bg);
          color: var(--tw-up);
        }

        .type-badge-sm.sell {
          background: var(--tw-down-bg);
          color: var(--tw-down);
        }

        .table-actions {
          display: flex;
          gap: 10px;
        }

        .action-link {
          background: none;
          border: none;
          color: var(--brand-primary);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          padding: 0;
        }

        .action-link.delete {
          color: var(--tw-up);
        }

        .empty-tx {
          padding: 32px;
          text-align: center;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
};
