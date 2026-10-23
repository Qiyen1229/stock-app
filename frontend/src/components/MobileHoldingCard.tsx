import React from 'react';
import { TrendingUp, TrendingDown, ChevronRight } from 'lucide-react';
import { HoldingItem } from '../contexts/PortfolioContext';
import { 
  formatCurrency, 
  formatStockPrice, 
  formatShares, 
  formatPercent, 
  getProfitClass 
} from '../utils/formatters';

interface MobileHoldingCardProps {
  holding: HoldingItem;
  onClick: (symbol: string) => void;
}

export const MobileHoldingCard: React.FC<MobileHoldingCardProps> = ({ holding, onClick }) => {
  const isUp = holding.unrealizedProfit > 0;
  const isDown = holding.unrealizedProfit < 0;

  return (
    <div 
      className="mobile-holding-card glass-card"
      onClick={() => onClick(holding.symbol)}
      role="button"
      tabIndex={0}
    >
      {/* 頂部：代號、名稱、市場標籤與今日漲跌 */}
      <div className="card-header-row">
        <div className="stock-title-group">
          <div className="symbol-badge">{holding.symbol}</div>
          <span className="stock-name nowrap">{holding.name}</span>
          <span className={`market-tag ${holding.market === 'ETF' ? 'tag-etf' : ''}`}>
            {holding.market}
          </span>
        </div>

        <div className="header-right-action">
          <div className={`today-badge nowrap ${getProfitClass(holding.todayChange)}`}>
            {holding.todayChange >= 0 ? '+' : ''}{holding.todayChange} ({formatPercent(holding.todayChangePercent)})
          </div>
          <ChevronRight size={18} className="chevron-icon" />
        </div>
      </div>

      {/* 主數據網格：2欄排版 */}
      <div className="card-data-grid">
        <div className="data-item">
          <span className="data-label">持有股數</span>
          <span className="data-value nowrap">{formatShares(holding.shares)}</span>
        </div>

        <div className="data-item text-right">
          <span className="data-label">目前股價</span>
          <span className="data-value current-price-text nowrap">
            {formatStockPrice(holding.currentPrice)}
          </span>
        </div>

        <div className="data-item">
          <span className="data-label">成本均價</span>
          <span className="data-value nowrap">{formatStockPrice(holding.avgCost)}</span>
        </div>

        <div className="data-item text-right">
          <span className="data-label">投資成本</span>
          <span className="data-value nowrap">{formatCurrency(holding.totalCost)}</span>
        </div>

        <div className="data-item">
          <span className="data-label">目前市值</span>
          <span className="data-value highlight nowrap">{formatCurrency(holding.marketValue)}</span>
        </div>

        <div className="data-item text-right">
          <span className="data-label">未實現損益</span>
          <div className={`profit-badge-cell nowrap ${getProfitClass(holding.unrealizedProfit)}`}>
            {isUp && <TrendingUp size={14} />}
            {isDown && <TrendingDown size={14} />}
            <span>
              {holding.unrealizedProfit >= 0 ? '+' : ''}{formatCurrency(holding.unrealizedProfit)} ({formatPercent(holding.profitRate)})
            </span>
          </div>
        </div>
      </div>

      <style>{`
        .mobile-holding-card {
          padding: 14px 16px;
          margin-bottom: 12px;
          cursor: pointer;
          user-select: none;
          border-left: 4px solid var(--border-subtle);
          transition: transform 0.12s ease, border-color 0.12s ease;
        }

        .mobile-holding-card:active {
          transform: scale(0.985);
          background-color: var(--bg-surface-elevated);
        }

        .card-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 10px;
          border-bottom: 1px solid var(--border-subtle);
          margin-bottom: 10px;
        }

        .stock-title-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .symbol-badge {
          background: var(--bg-surface-elevated);
          color: var(--text-main);
          font-weight: 700;
          font-size: 13px;
          padding: 2px 7px;
          border-radius: var(--radius-sm);
          letter-spacing: 0.5px;
        }

        .stock-name {
          font-weight: 700;
          font-size: 16px;
          color: var(--text-main);
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

        .header-right-action {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .today-badge {
          font-size: 12px;
          font-weight: 600;
        }

        .chevron-icon {
          color: var(--text-muted);
        }

        .card-data-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          row-gap: 8px;
          column-gap: 12px;
        }

        .data-item {
          display: flex;
          flex-direction: column;
        }

        .text-right {
          align-items: flex-end;
          text-align: right;
        }

        .data-label {
          font-size: 11px;
          color: var(--text-muted);
          margin-bottom: 2px;
          font-weight: 500;
        }

        .data-value {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-main);
        }

        .data-value.highlight {
          font-size: 15px;
          font-weight: 700;
        }

        .current-price-text {
          font-weight: 700;
        }

        .profit-badge-cell {
          font-size: 13px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 3px;
        }
      `}</style>
    </div>
  );
};
