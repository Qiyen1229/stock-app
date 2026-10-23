import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Layers, 
  PieChart as PieIcon, 
  DollarSign,
  ChevronRight
} from 'lucide-react';
import { usePortfolio } from '../contexts/PortfolioContext';
import { MobileHoldingCard } from '../components/MobileHoldingCard';
import { AssetPieChart } from '../components/AssetPieChart';
import { 
  formatCurrency, 
  formatStockPrice, 
  formatShares, 
  formatPercent, 
  getProfitClass,
  getProfitBadgeClass
} from '../utils/formatters';

interface DashboardPageProps {
  onOpenNewTransaction: () => void;
  onSelectStock: (symbol: string) => void;
  onNavigateTab: (tab: any) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onOpenNewTransaction,
  onSelectStock,
  onNavigateTab,
}) => {
  const { summary, holdings, isLoading } = usePortfolio();

  const totalMarketValue = summary?.totalMarketValue || 0;
  const totalCost = summary?.totalCost || 0;
  const totalProfit = summary?.totalProfit || 0;
  const totalProfitRate = summary?.totalProfitRate || 0;
  const todayProfit = summary?.todayProfit || 0;
  const stockCount = summary?.stockCount || 0;
  const etfCount = summary?.etfCount || 0;

  const isProfitPositive = totalProfit > 0;
  const isProfitNegative = totalProfit < 0;

  return (
    <div className="dashboard-page">
      {/* 【二、iPhone 手機版 UI】核心資產 Hero Card (明顯視覺層級) */}
      <section className="hero-asset-card glass-card">
        <div className="hero-top-row">
          <span className="hero-label">總資產 (目前總市值)</span>
          <div className={`hero-status-pill ${getProfitClass(totalProfit)}`}>
            {isProfitPositive && <TrendingUp size={14} />}
            {isProfitNegative && <TrendingDown size={14} />}
            <span className="nowrap">{totalProfitRate >= 0 ? '+' : ''}{formatPercent(totalProfitRate)}</span>
          </div>
        </div>

        <div className="hero-main-value-row">
          <h1 className="hero-asset-amount nowrap">{formatCurrency(totalMarketValue)}</h1>
        </div>

        <div className="hero-metrics-row">
          <div className="metric-box">
            <span className="metric-sublabel">總投入成本</span>
            <span className="metric-subvalue nowrap">{formatCurrency(totalCost)}</span>
          </div>

          <div className="metric-box right">
            <span className="metric-sublabel">未實現總損益</span>
            <span className={`metric-subvalue highlight nowrap ${getProfitClass(totalProfit)}`}>
              {totalProfit >= 0 ? '+' : ''}{formatCurrency(totalProfit)}
            </span>
          </div>
        </div>
      </section>

      {/* 次要指標：今日損益、持倉數、ETF數 */}
      <section className="stats-row-3">
        <div className="stat-card glass-card">
          <div className="stat-card-label">今日損益</div>
          <div className={`stat-card-value nowrap ${getProfitClass(todayProfit)}`}>
            {todayProfit >= 0 ? '+' : ''}{formatCurrency(todayProfit)}
          </div>
        </div>

        <div className="stat-card glass-card">
          <div className="stat-card-label">股票持倉</div>
          <div className="stat-card-value nowrap">{stockCount} <span className="stat-unit">檔</span></div>
        </div>

        <div className="stat-card glass-card">
          <div className="stat-card-label">ETF 數量</div>
          <div className="stat-card-value highlight-gold nowrap">{etfCount} <span className="stat-unit">檔</span></div>
        </div>
      </section>

      {/* 資產配置環形圖板塊 */}
      {summary && summary.allocation && summary.allocation.length > 0 && (
        <section className="section-block glass-card asset-allocation-block">
          <div className="section-header-row">
            <div className="section-title-wrap">
              <PieIcon size={18} className="section-icon" />
              <h2 className="section-title">資產配置比例</h2>
            </div>
          </div>
          <AssetPieChart allocation={summary.allocation} totalMarketValue={totalMarketValue} />
        </section>
      )}

      {/* 持倉板塊：手機版為卡片式 (MobileHoldingCard)，桌面版為完整 Table */}
      <section className="section-block">
        <div className="section-header-row">
          <div className="section-title-wrap">
            <Layers size={18} className="section-icon" />
            <h2 className="section-title">股票持倉總覽</h2>
            <span className="count-pill">{holdings.length}</span>
          </div>

          <button onClick={onOpenNewTransaction} className="touch-btn touch-btn-primary add-quick-btn">
            <Plus size={16} />
            <span className="nowrap">記一筆</span>
          </button>
        </div>

        {holdings.length === 0 ? (
          <div className="empty-state glass-card">
            <p className="empty-title">目前尚未建立持倉</p>
            <p className="empty-desc">點擊下方「記一筆」按鈕，立即記錄您的第一筆台股或 ETF 買進！</p>
            <button onClick={onOpenNewTransaction} className="touch-btn touch-btn-primary mt-3">
              <Plus size={18} />
              <span>新增買進紀錄</span>
            </button>
          </div>
        ) : (
          <>
            {/* 手機版持倉卡片列表 (小於 1024px 顯示) */}
            <div className="mobile-holdings-container">
              {holdings.map((h) => (
                <MobileHoldingCard key={h.symbol} holding={h} onClick={onSelectStock} />
              ))}
            </div>

            {/* 桌面版持倉表格 (大於等於 1024px 顯示，極致工整對齊) */}
            <div className="desktop-holdings-table-wrap glass-card">
              <table className="desktop-table">
                <colgroup>
                  <col style={{ width: '18%' }} />
                  <col style={{ width: '8%' }} />
                  <col style={{ width: '9%' }} />
                  <col style={{ width: '10%' }} />
                  <col style={{ width: '10%' }} />
                  <col style={{ width: '10%' }} />
                  <col style={{ width: '11%' }} />
                  <col style={{ width: '10%' }} />
                  <col style={{ width: '11%' }} />
                  <col style={{ width: '3%' }} />
                </colgroup>
                <thead>
                  <tr>
                    <th className="col-left">標的 / 代號</th>
                    <th className="col-center">類別</th>
                    <th className="col-right">持有股數</th>
                    <th className="col-right">成本均價</th>
                    <th className="col-right">投資成本</th>
                    <th className="col-right">當前股價</th>
                    <th className="col-right">目前市值</th>
                    <th className="col-right">今日漲跌</th>
                    <th className="col-right">未實現損益</th>
                    <th className="col-center">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {holdings.map((h) => (
                    <tr key={h.symbol} onClick={() => onSelectStock(h.symbol)} className="clickable-row">
                      <td className="col-left">
                        <div className="table-symbol-cell">
                          <span className="sym-tag">{h.symbol}</span>
                          <span className="name-text">{h.name}</span>
                        </div>
                      </td>
                      <td className="col-center">
                        <span className={`market-badge ${h.market === 'ETF' ? 'badge-etf' : ''}`}>
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
                      <td className="col-center">
                        <ChevronRight size={16} className="table-arrow" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      {/* 手機版浮動 Action 按鈕 (FAB) */}
      <button 
        className="mobile-fab-btn" 
        onClick={onOpenNewTransaction}
        aria-label="新增交易"
      >
        <Plus size={26} strokeWidth={2.5} />
      </button>

      <style>{`
        .dashboard-page {
          display: flex;
          flex-direction: column;
          gap: 16px;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
          padding: 16px 16px;
        }

        /* 核心資產 Hero Card */
        .hero-asset-card {
          padding: 22px 20px;
          background: linear-gradient(145deg, var(--bg-surface) 0%, var(--bg-surface-elevated) 100%);
          border: 1px solid var(--border-subtle);
          position: relative;
          overflow: hidden;
        }

        .hero-asset-card::before {
          content: '';
          position: absolute;
          top: -40px;
          right: -40px;
          width: 160px;
          height: 160px;
          background: var(--brand-glow);
          border-radius: 50%;
          filter: blur(50px);
          pointer-events: none;
        }

        .hero-top-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 6px;
        }

        .hero-label {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
          letter-spacing: -0.2px;
        }

        .hero-status-pill {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: var(--radius-sm);
          background: var(--bg-app);
        }

        .hero-main-value-row {
          margin-bottom: 18px;
        }

        .hero-asset-amount {
          font-size: 34px;
          font-weight: 800;
          color: var(--text-main);
          letter-spacing: -0.8px;
          line-height: 1.1;
        }

        @media (min-width: 640px) {
          .hero-asset-amount {
            font-size: 40px;
          }
        }

        .hero-metrics-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          padding-top: 14px;
          border-top: 1px solid var(--border-subtle);
        }

        .metric-box {
          display: flex;
          flex-direction: column;
        }

        .metric-box.right {
          align-items: flex-end;
          text-align: right;
        }

        .metric-sublabel {
          font-size: 11px;
          color: var(--text-muted);
          font-weight: 500;
          margin-bottom: 2px;
        }

        .metric-subvalue {
          font-size: 16px;
          font-weight: 700;
          color: var(--text-main);
        }

        .metric-subvalue.highlight {
          font-size: 17px;
        }

        /* 3 個次要指標卡片 */
        .stats-row-3 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }

        .stat-card {
          padding: 12px 14px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .stat-card-label {
          font-size: 11px;
          font-weight: 500;
          color: var(--text-muted);
          margin-bottom: 4px;
        }

        .stat-card-value {
          font-size: 16px;
          font-weight: 700;
          color: var(--text-main);
        }

        .stat-unit {
          font-size: 11px;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .highlight-gold {
          color: var(--brand-gold);
        }

        /* 區塊標準排版 */
        .section-block {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .asset-allocation-block {
          padding: 16px 20px;
        }

        .section-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 4px 0;
        }

        .section-title-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .section-icon {
          color: var(--brand-primary);
        }

        .section-title {
          font-size: 17px;
          font-weight: 700;
          color: var(--text-main);
        }

        .count-pill {
          background: var(--bg-surface-elevated);
          color: var(--text-secondary);
          font-size: 12px;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 9999px;
        }

        .add-quick-btn {
          height: 36px;
          padding: 0 14px;
          font-size: 13px;
          gap: 6px;
        }

        /* 手機 vs 桌面排版響應切換 */
        .mobile-holdings-container {
          display: block;
        }

        .desktop-holdings-table-wrap {
          display: none;
        }

        @media (min-width: 1024px) {
          .mobile-holdings-container {
            display: none;
          }
          .desktop-holdings-table-wrap {
            display: block;
            overflow-x: auto;
          }
        }

        /* 桌面版表格風格 (專業金融級別) */
        .desktop-holdings-table-wrap {
          width: 100%;
          overflow-x: auto;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-subtle);
        }

        .desktop-table {
          width: 100%;
          table-layout: fixed;
          border-collapse: collapse;
          font-size: 14px;
          min-width: 960px;
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
          transition: background-color var(--transition-fast);
        }

        .clickable-row:hover {
          background-color: var(--bg-surface-elevated);
        }

        .table-symbol-cell {
          display: flex;
          align-items: center;
          gap: 8px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }

        .sym-tag {
          font-weight: 700;
          background: var(--bg-surface-elevated);
          padding: 2px 6px;
          border-radius: var(--radius-sm);
          flex-shrink: 0;
        }

        .name-text {
          font-weight: 600;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .market-badge {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-muted);
          background: var(--bg-surface-elevated);
          padding: 2px 6px;
          border-radius: 4px;
          white-space: nowrap !important;
          display: inline-block !important;
          min-width: 42px;
          text-align: center;
        }

        .badge-etf {
          color: var(--brand-gold);
          background: var(--brand-gold-glow);
        }

        .font-bold {
          font-weight: 700;
        }

        .table-arrow {
          color: var(--text-muted);
        }

        /* 空狀態 */
        .empty-state {
          padding: 40px 20px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .empty-title {
          font-size: 17px;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 6px;
        }

        .empty-desc {
          font-size: 13px;
          color: var(--text-secondary);
          max-width: 320px;
          margin-bottom: 16px;
        }

        .mt-3 {
          margin-top: 12px;
        }

        /* 手機版 FAB 按鈕 */
        .mobile-fab-btn {
          position: fixed;
          right: 20px;
          bottom: calc(72px + var(--safe-bottom) + 16px);
          width: 56px;
          height: 56px;
          border-radius: 28px;
          background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%);
          color: #FFFFFF;
          border: none;
          box-shadow: 0 6px 20px var(--brand-glow);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 85;
          cursor: pointer;
          transition: transform 0.1s ease;
        }

        .mobile-fab-btn:active {
          transform: scale(0.92);
        }

        @media (min-width: 1024px) {
          .mobile-fab-btn {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};
