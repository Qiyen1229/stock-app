import React, { useState, useEffect } from 'react';
import { Coins, Calendar, TrendingUp, AlertCircle, ArrowUpRight } from 'lucide-react';
import { request } from '../api/client';
import { formatCurrency, formatShares } from '../utils/formatters';

interface EtfCard {
  symbol: string;
  name: string;
  frequency: string;
  shares: number;
  amountPerShare: number;
  estimatedPayout: number;
  nextExDate: string;
  nextPaymentDate: string;
  yieldRate: number;
}

interface MonthlyItem {
  month: string;
  amount: number;
}

interface DividendData {
  summary: {
    totalEstimatedAnnual: number;
    currentYearTotal: number;
    heldEtfCount: number;
  };
  etfCards: EtfCard[];
  records: any[];
  monthlyDistribution: MonthlyItem[];
}

interface DividendsPageProps {
  onSelectStock: (symbol: string) => void;
  onOpenTrade: () => void;
}

export const DividendsPage: React.FC<DividendsPageProps> = ({ onSelectStock, onOpenTrade }) => {
  const [data, setData] = useState<DividendData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadDividendCenter = async () => {
      setIsLoading(true);
      try {
        const res = await request<DividendData>('/dividends');
        if (isMounted) setData(res);
      } catch (err) {
        console.error('載入配息中心失敗:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadDividendCenter();
    return () => { isMounted = false; };
  }, []);

  const summary = data?.summary;
  const etfCards = data?.etfCards || [];
  const monthly = data?.monthlyDistribution || [];
  const maxMonthAmount = Math.max(...monthly.map(m => m.amount), 1);

  return (
    <div className="dividends-page">
      {/* 頂部年度配息概要卡片 */}
      <section className="dividend-hero-card glass-card">
        <div className="hero-head">
          <div className="title-box">
            <Coins size={22} className="gold-icon" />
            <h1 className="hero-title">ETF 配息追蹤中心</h1>
          </div>
          <span className="hero-badge">持有 {summary?.heldEtfCount || 0} 檔高息標的</span>
        </div>

        <div className="hero-values-row">
          <div className="val-block">
            <span className="val-label">預估年度總配息</span>
            <span className="val-num gold-text nowrap">{formatCurrency(summary?.totalEstimatedAnnual || 0)}</span>
          </div>

          <div className="val-block right">
            <span className="val-label">今年已發放 / 累計領息</span>
            <span className="val-num nowrap">{formatCurrency(summary?.currentYearTotal || 0)}</span>
          </div>
        </div>
      </section>

      {/* 每月配息分佈統計長條圖 (修正暗色模式字體清晰) */}
      <section className="monthly-chart-card glass-card">
        <div className="section-head">
          <Calendar size={18} className="gold-icon" />
          <h2 className="section-title">每月預估現金流分佈 (1~12月)</h2>
        </div>

        <div className="bar-chart-container">
          {monthly.map((m) => {
            const heightPercent = Math.max(8, Math.round((m.amount / maxMonthAmount) * 100));
            const hasAmount = m.amount > 0;

            return (
              <div key={m.month} className="bar-column">
                <div className="bar-hover-val nowrap">
                  {hasAmount ? `NT$ ${m.amount.toLocaleString()}` : ''}
                </div>
                <div className="bar-track">
                  <div 
                    className={`bar-fill ${hasAmount ? 'filled' : 'empty'}`}
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>
                <span className={`bar-label ${hasAmount ? 'active-label' : ''}`}>{m.month}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* 持有 ETF 專屬除息發放預告卡片 */}
      <section className="etf-list-section">
        <div className="section-head">
          <TrendingUp size={18} className="gold-icon" />
          <h2 className="section-title">我的 ETF 最新配息時程</h2>
        </div>

        {etfCards.length === 0 ? (
          <div className="empty-etf-card glass-card">
            <AlertCircle size={24} className="gold-icon" />
            <p className="empty-text">您目前尚未持有支援配息的 ETF（例如 0056、00878、00919、00929 等）</p>
            <button onClick={onOpenTrade} className="touch-btn touch-btn-primary mt-2">
              新增 ETF 交易紀錄
            </button>
          </div>
        ) : (
          <div className="etf-cards-wrapper">
            {etfCards.map((etf) => (
              <div 
                key={etf.symbol} 
                className="etf-schedule-card glass-card"
                onClick={() => onSelectStock(etf.symbol)}
              >
                <div className="card-top">
                  <div className="etf-name-group">
                    <span className="etf-sym">{etf.symbol}</span>
                    <span className="etf-name nowrap">{etf.name}</span>
                    <span className="freq-badge">{etf.frequency}</span>
                  </div>

                  <ArrowUpRight size={18} className="arrow-icon" />
                </div>

                <div className="card-data-grid">
                  <div className="data-box">
                    <span className="data-lbl">持有股數</span>
                    <span className="data-val nowrap">{formatShares(etf.shares)}</span>
                  </div>

                  <div className="data-box right">
                    <span className="data-lbl">每股預估配息</span>
                    <span className="data-val nowrap">NT$ {etf.amountPerShare.toFixed(2)} / 股</span>
                  </div>

                  <div className="data-box highlight-box">
                    <span className="data-lbl">預估本次領息</span>
                    <span className="data-val gold-text font-bold nowrap">{formatCurrency(etf.estimatedPayout)}</span>
                  </div>

                  <div className="data-box right highlight-box">
                    <span className="data-lbl">預估年化殖利率</span>
                    <span className="data-val gold-text font-bold nowrap">{etf.yieldRate}%</span>
                  </div>

                  <div className="data-box date-box">
                    <span className="data-lbl">除息日</span>
                    <span className="data-val nowrap">{etf.nextExDate}</span>
                  </div>

                  <div className="data-box right date-box">
                    <span className="data-lbl">預估發放日</span>
                    <span className="data-val nowrap">{etf.nextPaymentDate}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <style>{`
        .dividends-page {
          max-width: 1000px;
          margin: 0 auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          width: 100%;
        }

        .gold-icon {
          color: var(--brand-gold);
        }

        .gold-text {
          color: var(--brand-gold) !important;
        }

        .dividend-hero-card {
          padding: 20px;
          background: linear-gradient(145deg, var(--bg-surface) 0%, var(--bg-surface-elevated) 100%);
        }

        .hero-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .title-box {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .hero-title {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-main);
        }

        .hero-badge {
          font-size: 12px;
          color: var(--brand-gold);
          background: var(--brand-gold-glow);
          padding: 3px 8px;
          border-radius: var(--radius-sm);
          font-weight: 600;
        }

        .hero-values-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          padding-top: 14px;
          border-top: 1px solid var(--border-subtle);
        }

        .val-block {
          display: flex;
          flex-direction: column;
        }

        .val-block.right {
          align-items: flex-end;
          text-align: right;
        }

        .val-label {
          font-size: 12px;
          color: var(--text-muted);
          margin-bottom: 4px;
        }

        .val-num {
          font-size: 22px;
          font-weight: 800;
          color: var(--text-main);
        }

        /* 長條圖排版 */
        .monthly-chart-card {
          padding: 20px;
        }

        .section-head {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
        }

        .section-title {
          font-size: 16px;
          font-weight: 700;
          color: var(--text-main);
        }

        .bar-chart-container {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          height: 160px;
          padding: 10px 0;
          gap: 6px;
        }

        .bar-column {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          height: 100%;
          justify-content: flex-end;
          position: relative;
        }

        .bar-hover-val {
          font-size: 9px;
          font-weight: 600;
          color: var(--brand-gold);
          margin-bottom: 4px;
          min-height: 14px;
        }

        .bar-track {
          width: 100%;
          max-width: 24px;
          height: 110px;
          background: var(--bg-surface-elevated);
          border-radius: 4px;
          display: flex;
          align-items: flex-end;
          overflow: hidden;
        }

        .bar-fill {
          width: 100%;
          border-radius: 4px;
          transition: height 0.4s ease;
        }

        .bar-fill.filled {
          background: linear-gradient(180deg, #F59E0B 0%, #D97706 100%);
          box-shadow: 0 0 10px var(--brand-gold-glow);
        }

        .bar-fill.empty {
          background: var(--border-subtle);
        }

        .bar-label {
          font-size: 11px;
          font-weight: 500;
          color: var(--text-muted);
          margin-top: 6px;
        }

        .bar-label.active-label {
          color: var(--text-main);
          font-weight: 700;
        }

        /* ETF 清單卡片 */
        .etf-list-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .etf-cards-wrapper {
          display: grid;
          grid-template-columns: 1fr;
          gap: 14px;
        }

        @media (min-width: 768px) {
          .etf-cards-wrapper {
            grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          }
        }

        .etf-schedule-card {
          padding: 16px;
          cursor: pointer;
          border-left: 4px solid var(--brand-gold);
          transition: transform var(--transition-fast);
        }

        .etf-schedule-card:active {
          transform: scale(0.985);
        }

        .card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 10px;
          border-bottom: 1px solid var(--border-subtle);
          margin-bottom: 10px;
        }

        .etf-name-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .etf-sym {
          font-weight: 700;
          background: var(--bg-surface-elevated);
          padding: 2px 7px;
          border-radius: var(--radius-sm);
        }

        .etf-name {
          font-size: 15px;
          font-weight: 700;
        }

        .freq-badge {
          font-size: 11px;
          background: var(--brand-gold-glow);
          color: var(--brand-gold);
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 600;
        }

        .arrow-icon {
          color: var(--text-muted);
        }

        .card-data-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          row-gap: 8px;
        }

        .data-box {
          display: flex;
          flex-direction: column;
        }

        .data-box.right {
          align-items: flex-end;
          text-align: right;
        }

        .data-lbl {
          font-size: 11px;
          color: var(--text-muted);
          margin-bottom: 2px;
        }

        .data-val {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-main);
        }

        .font-bold {
          font-weight: 700;
        }

        .highlight-box {
          background: var(--bg-surface-elevated);
          padding: 6px 8px;
          border-radius: var(--radius-sm);
        }

        .date-box {
          padding-top: 4px;
        }

        .empty-etf-card {
          padding: 32px 20px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .empty-text {
          font-size: 14px;
          color: var(--text-secondary);
          max-width: 400px;
        }

        .mt-2 {
          margin-top: 8px;
        }
      `}</style>
    </div>
  );
};
