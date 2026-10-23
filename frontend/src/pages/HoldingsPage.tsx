import React, { useState } from 'react';
import { Layers, Search, Filter, Plus, ChevronRight } from 'lucide-react';
import { usePortfolio } from '../contexts/PortfolioContext';
import { MobileHoldingCard } from '../components/MobileHoldingCard';
import { 
  formatCurrency, 
  formatStockPrice, 
  formatShares, 
  formatPercent, 
  getProfitClass 
} from '../utils/formatters';

interface HoldingsPageProps {
  onSelectStock: (symbol: string) => void;
  onOpenTrade: () => void;
}

export const HoldingsPage: React.FC<HoldingsPageProps> = ({ onSelectStock, onOpenTrade }) => {
  const { holdings } = usePortfolio();
  const [filterType, setFilterType] = useState<'ALL' | 'STOCK' | 'ETF'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHoldings = holdings.filter((h) => {
    const matchesFilter =
      filterType === 'ALL' ||
      (filterType === 'ETF' && h.market === 'ETF') ||
      (filterType === 'STOCK' && h.market !== 'ETF');

    const matchesSearch =
      !searchTerm.trim() ||
      h.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.name.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="holdings-page">
      {/* 頂部標題與操作列 */}
      <div className="holdings-top-bar">
        <div className="title-wrap">
          <Layers size={22} className="brand-icon" />
          <h1 className="page-title">全部持倉清單</h1>
          <span className="count-badge">{filteredHoldings.length}</span>
        </div>

        <button onClick={onOpenTrade} className="touch-btn touch-btn-primary add-btn">
          <Plus size={16} />
          <span>新增買進</span>
        </button>
      </div>

      {/* 搜尋與篩選標籤 */}
      <div className="filter-controls-card glass-card">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="搜尋持有之股票代號或名稱..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-pills">
          <button
            type="button"
            className={`filter-pill ${filterType === 'ALL' ? 'active' : ''}`}
            onClick={() => setFilterType('ALL')}
          >
            全部 ({holdings.length})
          </button>
          <button
            type="button"
            className={`filter-pill ${filterType === 'STOCK' ? 'active' : ''}`}
            onClick={() => setFilterType('STOCK')}
          >
            上市/上櫃個股 ({holdings.filter((h) => h.market !== 'ETF').length})
          </button>
          <button
            type="button"
            className={`filter-pill ${filterType === 'ETF' ? 'active' : ''}`}
            onClick={() => setFilterType('ETF')}
          >
            ETF 標的 ({holdings.filter((h) => h.market === 'ETF').length})
          </button>
        </div>
      </div>

      {/* 持倉內容 */}
      {filteredHoldings.length === 0 ? (
        <div className="empty-box glass-card">
          <p>沒有符合條件的持倉標的</p>
        </div>
      ) : (
        <>
          {/* 手機版卡片列表 */}
          <div className="mobile-list">
            {filteredHoldings.map((h) => (
              <MobileHoldingCard key={h.symbol} holding={h} onClick={onSelectStock} />
            ))}
          </div>

          {/* 桌面版表格 */}
          <div className="desktop-table-wrap glass-card">
            <table className="desktop-table">
              <colgroup>
                <col style={{ width: '16%' }} />
                <col style={{ width: '7%' }} />
                <col style={{ width: '9%' }} />
                <col style={{ width: '9%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '6%' }} />
                <col style={{ width: '3%' }} />
              </colgroup>
              <thead>
                <tr>
                  <th className="col-left">代號 / 名稱</th>
                  <th className="col-center">市場</th>
                  <th className="col-right">持有股數</th>
                  <th className="col-right">成本均價</th>
                  <th className="col-right">投資成本</th>
                  <th className="col-right">當前股價</th>
                  <th className="col-right">目前市值</th>
                  <th className="col-right">今日漲跌</th>
                  <th className="col-right">未實現損益</th>
                  <th className="col-right">資產佔比</th>
                  <th className="col-center">詳情</th>
                </tr>
              </thead>
              <tbody>
                {filteredHoldings.map((h) => (
                  <tr key={h.symbol} onClick={() => onSelectStock(h.symbol)} className="clickable-row">
                    <td className="col-left">
                      <div className="sym-col">
                        <span className="sym-badge">{h.symbol}</span>
                        <span className="sym-name">{h.name}</span>
                      </div>
                    </td>
                    <td className="col-center">
                      <span className={`market-tag ${h.market === 'ETF' ? 'tag-etf' : ''}`}>
                        {h.market}
                      </span>
                    </td>
                    <td className="col-right tabular-nums">{formatShares(h.shares)}</td>
                    <td className="col-right tabular-nums">{formatStockPrice(h.avgCost)}</td>
                    <td className="col-right tabular-nums">{formatCurrency(h.totalCost)}</td>
                    <td className="col-right tabular-nums font-bold">{formatStockPrice(h.currentPrice)}</td>
                    <td className="col-right tabular-nums font-bold">{formatCurrency(h.marketValue)}</td>
                    <td className={`col-right tabular-nums ${getProfitClass(h.todayChange)}`}>
                      {h.todayChange >= 0 ? '+' : ''}{h.todayChange} ({formatPercent(h.todayChangePercent)})
                    </td>
                    <td className="col-right tabular-nums">
                      <span className={`font-bold ${getProfitClass(h.unrealizedProfit)}`}>
                        {h.unrealizedProfit >= 0 ? '+' : ''}{formatCurrency(h.unrealizedProfit)} ({formatPercent(h.profitRate)})
                      </span>
                    </td>
                    <td className="col-right tabular-nums font-bold">{h.portfolioRatio}%</td>
                    <td className="col-center">
                      <ChevronRight size={16} className="arrow-muted" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <style>{`
        .holdings-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          width: 100%;
        }

        .brand-icon {
          color: var(--brand-primary);
        }

        .holdings-top-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .title-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .page-title {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-main);
        }

        .count-badge {
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

        .filter-controls-card {
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .search-box {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          color: var(--text-muted);
          pointer-events: none;
        }

        .search-box input {
          padding-left: 38px;
        }

        .filter-pills {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 2px;
        }

        .filter-pill {
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-subtle);
          color: var(--text-secondary);
          font-size: 13px;
          font-weight: 600;
          padding: 6px 12px;
          border-radius: 9999px;
          cursor: pointer;
          white-space: nowrap;
          transition: all var(--transition-fast);
        }

        .filter-pill.active {
          background: var(--brand-primary);
          color: #FFFFFF;
          border-color: var(--brand-primary);
        }

        .mobile-list {
          display: block;
        }

        .desktop-table-wrap {
          display: none;
        }

        @media (min-width: 1024px) {
          .mobile-list {
            display: none;
          }
          .desktop-table-wrap {
            display: block;
            overflow-x: auto;
          }
        }

        .desktop-table {
          width: 100%;
          table-layout: fixed;
          border-collapse: collapse;
          font-size: 14px;
          min-width: 980px;
        }

        .desktop-table th {
          padding: 14px 12px;
          background: var(--bg-surface-elevated);
          color: var(--text-secondary);
          font-weight: 600;
          font-size: 13px;
          border-bottom: 1px solid var(--border-subtle);
          white-space: nowrap;
        }

        .desktop-table td {
          padding: 14px 12px;
          border-bottom: 1px solid var(--border-subtle);
          color: var(--text-main);
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

        .clickable-row {
          cursor: pointer;
        }

        .clickable-row:hover {
          background: var(--bg-surface-elevated);
        }

        .sym-col {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .sym-badge {
          font-weight: 700;
          background: var(--bg-surface-elevated);
          padding: 2px 6px;
          border-radius: var(--radius-sm);
        }

        .sym-name {
          font-weight: 600;
        }

        .market-tag {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-muted);
          background: var(--bg-surface-elevated);
          padding: 2px 6px;
          border-radius: 4px;
        }

        .tag-etf {
          color: var(--brand-gold);
          background: var(--brand-gold-glow);
        }

        .font-bold {
          font-weight: 700;
        }

        .arrow-muted {
          color: var(--text-muted);
        }

        .empty-box {
          padding: 32px;
          text-align: center;
          color: var(--text-muted);
          font-size: 14px;
        }
      `}</style>
    </div>
  );
};
