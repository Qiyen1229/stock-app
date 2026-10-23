import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Minus, 
  Calendar, 
  Coins, 
  Info,
  Clock
} from 'lucide-react';
import { request } from '../api/client';
import { usePortfolio } from '../contexts/PortfolioContext';
import { StockHistoryChart, ChartPoint } from '../components/StockHistoryChart';
import { 
  formatCurrency, 
  formatStockPrice, 
  formatShares, 
  formatPercent, 
  getProfitClass 
} from '../utils/formatters';

interface StockDetailPageProps {
  symbol: string;
  onBack: () => void;
  onOpenTrade: (symbol: string, type: 'BUY' | 'SELL') => void;
}

export const StockDetailPage: React.FC<StockDetailPageProps> = ({
  symbol,
  onBack,
  onOpenTrade,
}) => {
  const { holdings } = usePortfolio();
  const [stockDetail, setStockDetail] = useState<any>(null);
  const [historyData, setHistoryData] = useState<ChartPoint[]>([]);
  const [timeframe, setTimeframe] = useState('1M');
  const [isLoadingChart, setIsLoadingChart] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(true);

  // 當前使用者是否持有該標的
  const userHolding = holdings.find((h) => h.symbol === symbol);

  // 載入基本個股資訊
  useEffect(() => {
    let isMounted = true;
    const loadDetail = async () => {
      setIsLoadingDetail(true);
      try {
        const data = await request<{ stock: any }>(`/stocks/${symbol}`);
        if (isMounted) setStockDetail(data.stock);
      } catch (err) {
        console.error('載入股票詳情失敗:', err);
      } finally {
        if (isMounted) setIsLoadingDetail(false);
      }
    };
    loadDetail();
    return () => { isMounted = false; };
  }, [symbol]);

  // 載入歷史價格走勢圖
  useEffect(() => {
    let isMounted = true;
    const loadHistory = async () => {
      setIsLoadingChart(true);
      try {
        const data = await request<{ history: ChartPoint[] }>(`/stocks/${symbol}/history?timeframe=${timeframe}`);
        if (isMounted) setHistoryData(data.history || []);
      } catch (err) {
        console.error('載入歷史走勢失敗:', err);
      } finally {
        if (isMounted) setIsLoadingChart(false);
      }
    };
    loadHistory();
    return () => { isMounted = false; };
  }, [symbol, timeframe]);

  const quote = stockDetail?.quote;
  const dividendInfo = stockDetail?.dividendInfo;
  const isUp = (quote?.change || 0) >= 0;

  return (
    <div className="stock-detail-page">
      {/* 頂部返回導覽 */}
      <div className="detail-top-nav">
        <button onClick={onBack} className="back-nav-btn" aria-label="返回上一頁">
          <ArrowLeft size={20} />
          <span className="nowrap">返回總覽</span>
        </button>

        <div className="quote-status-tag">
          <Clock size={12} />
          <span>{quote?.updatedAt ? `更新於 ${quote.updatedAt}` : '更新中'}</span>
          <span className="status-mode">({quote?.status || '報價'})</span>
        </div>
      </div>

      {/* 【六、股票詳細頁手機版】頂部主要行情區塊 */}
      <section className="stock-header-card glass-card">
        <div className="title-row">
          <div className="stock-identity">
            <h1 className="stock-title nowrap">{stockDetail?.name || symbol}</h1>
            <div className="sub-meta">
              <span className="sym-badge">{symbol}</span>
              <span className="market-tag">{stockDetail?.market || '上市'}</span>
              {stockDetail?.industry && <span className="industry-tag">{stockDetail.industry}</span>}
            </div>
          </div>

          <div className="price-badge-group">
            <div className="big-price nowrap">
              {formatStockPrice(quote?.price || (userHolding?.currentPrice || 0))}
            </div>
            <div className={`change-pill nowrap ${getProfitClass(quote?.change || 0)}`}>
              {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span>
                {isUp ? '+' : ''}{quote?.change || 0} ({formatPercent(quote?.changePercent || 0)})
              </span>
            </div>
          </div>
        </div>

        {/* 歷史價格走勢圖 (完美適配手機，不溢出螢幕) */}
        <div className="chart-section-wrap">
          <StockHistoryChart
            data={historyData}
            timeframe={timeframe}
            onTimeframeChange={setTimeframe}
            isLoading={isLoadingChart}
          />
        </div>
      </section>

      {/* 使用者持倉詳情 (若有持有) */}
      <section className="user-holding-section glass-card">
        <div className="section-subtitle-wrap">
          <h2 className="section-subtitle">您的持倉狀態</h2>
          {userHolding && (
            <span className="ratio-tag">佔總資產 {userHolding.portfolioRatio}%</span>
          )}
        </div>

        {userHolding ? (
          <div className="holding-metrics-grid">
            <div className="h-metric">
              <span className="h-label">持有股數</span>
              <span className="h-val nowrap">{formatShares(userHolding.shares)}</span>
            </div>

            <div className="h-metric text-right">
              <span className="h-label">目前市值</span>
              <span className="h-val highlight nowrap">{formatCurrency(userHolding.marketValue)}</span>
            </div>

            <div className="h-metric">
              <span className="h-label">成本均價</span>
              <span className="h-val nowrap">{formatStockPrice(userHolding.avgCost)}</span>
            </div>

            <div className="h-metric text-right">
              <span className="h-label">總成本 (投資成本)</span>
              <span className="h-val nowrap">{formatCurrency(userHolding.totalCost)}</span>
            </div>

            <div className="h-metric">
              <span className="h-label">未實現損益</span>
              <span className={`h-val font-bold nowrap ${getProfitClass(userHolding.unrealizedProfit)}`}>
                {userHolding.unrealizedProfit >= 0 ? '+' : ''}{formatCurrency(userHolding.unrealizedProfit)}
              </span>
            </div>

            <div className="h-metric text-right">
              <span className="h-label">總報酬率</span>
              <span className={`h-val font-bold nowrap ${getProfitClass(userHolding.profitRate)}`}>
                {userHolding.profitRate >= 0 ? '+' : ''}{formatPercent(userHolding.profitRate)}
              </span>
            </div>
          </div>
        ) : (
          <div className="no-holding-prompt">
            <p>您目前尚未持有此檔標的</p>
            <button 
              onClick={() => onOpenTrade(symbol, 'BUY')} 
              className="touch-btn touch-btn-primary add-pos-btn"
            >
              <Plus size={16} />
              <span>立即建立買進持倉</span>
            </button>
          </div>
        )}
      </section>

      {/* 【七、ETF 配息手機版】若為 ETF 則顯示專屬配息 Card */}
      {dividendInfo && (
        <section className="etf-dividend-section glass-card">
          <div className="etf-div-header">
            <div className="etf-div-title-wrap">
              <Coins size={18} className="gold-icon" />
              <h2 className="section-subtitle">{symbol} {stockDetail?.name} 配息資訊</h2>
            </div>
            <span className="frequency-pill">{dividendInfo.frequency}</span>
          </div>

          <div className="etf-div-cards-grid">
            <div className="etf-card-item highlight-border">
              <span className="etf-sub-label">下一次每股配息</span>
              <span className="etf-big-num nowrap">NT$ {dividendInfo.amountPerShare.toFixed(2)} <span className="small-unit">/ 股</span></span>
            </div>

            <div className="etf-card-item highlight-border">
              <span className="etf-sub-label">預估領息金額</span>
              <span className="etf-big-num text-gold nowrap">
                {userHolding 
                  ? formatCurrency(Math.round(userHolding.shares * dividendInfo.amountPerShare)) 
                  : '未持有'}
              </span>
            </div>

            <div className="etf-card-item">
              <span className="etf-sub-label">最近除息日</span>
              <span className="etf-date-val nowrap">{dividendInfo.lastExDate}</span>
            </div>

            <div className="etf-card-item">
              <span className="etf-sub-label">最近發放日</span>
              <span className="etf-date-val nowrap">{dividendInfo.lastPaymentDate}</span>
            </div>
          </div>

          <div className="yield-estimate-bar">
            <span>預估年化殖利率：</span>
            <strong className="text-gold nowrap">{dividendInfo.estimatedYield}%</strong>
          </div>
        </section>
      )}

      {/* 底部快捷操作 (買進 / 賣出) */}
      <div className="detail-bottom-actions">
        <button
          onClick={() => onOpenTrade(symbol, 'BUY')}
          className="touch-btn trade-action-btn btn-buy-lg"
        >
          <Plus size={18} />
          <span>買進 (Buy)</span>
        </button>

        {userHolding && userHolding.shares > 0 && (
          <button
            onClick={() => onOpenTrade(symbol, 'SELL')}
            className="touch-btn trade-action-btn btn-sell-lg"
          >
            <Minus size={18} />
            <span>賣出 (Sell)</span>
          </button>
        )}
      </div>

      <style>{`
        .stock-detail-page {
          max-width: 800px;
          margin: 0 auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          width: 100%;
        }

        .detail-top-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .back-nav-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: none;
          color: var(--brand-primary);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          padding: 6px 0;
        }

        .quote-status-tag {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          color: var(--text-muted);
        }

        .status-mode {
          color: var(--brand-primary);
        }

        .stock-header-card {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .title-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }

        .stock-title {
          font-size: 24px;
          font-weight: 800;
          color: var(--text-main);
          letter-spacing: -0.4px;
          margin-bottom: 4px;
        }

        .sub-meta {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .sym-badge {
          background: var(--bg-surface-elevated);
          color: var(--text-main);
          font-size: 13px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: var(--radius-sm);
        }

        .market-tag {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-muted);
          background: var(--bg-surface-elevated);
          padding: 2px 6px;
          border-radius: 4px;
        }

        .industry-tag {
          font-size: 11px;
          color: var(--text-secondary);
        }

        .price-badge-group {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        .big-price {
          font-size: 28px;
          font-weight: 800;
          color: var(--text-main);
          letter-spacing: -0.5px;
        }

        .change-pill {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;
          font-weight: 700;
        }

        .chart-section-wrap {
          width: 100%;
          overflow: hidden;
        }

        /* 持倉資訊區塊 */
        .user-holding-section {
          padding: 18px 20px;
        }

        .section-subtitle-wrap {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
          padding-bottom: 8px;
          border-bottom: 1px solid var(--border-subtle);
        }

        .section-subtitle {
          font-size: 16px;
          font-weight: 700;
          color: var(--text-main);
        }

        .ratio-tag {
          font-size: 12px;
          font-weight: 600;
          color: var(--brand-primary);
          background: var(--brand-glow);
          padding: 2px 8px;
          border-radius: var(--radius-sm);
        }

        .holding-metrics-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          row-gap: 12px;
          column-gap: 16px;
        }

        .h-metric {
          display: flex;
          flex-direction: column;
        }

        .text-right {
          align-items: flex-end;
          text-align: right;
        }

        .h-label {
          font-size: 12px;
          color: var(--text-muted);
          margin-bottom: 2px;
        }

        .h-val {
          font-size: 15px;
          font-weight: 600;
          color: var(--text-main);
        }

        .h-val.highlight {
          font-weight: 700;
        }

        .font-bold {
          font-weight: 700;
        }

        .no-holding-prompt {
          padding: 16px 0;
          text-align: center;
          color: var(--text-secondary);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }

        .add-pos-btn {
          height: 38px;
          font-size: 14px;
        }

        /* ETF 配息卡片 */
        .etf-dividend-section {
          padding: 18px 20px;
        }

        .etf-div-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
        }

        .etf-div-title-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .gold-icon {
          color: var(--brand-gold);
        }

        .frequency-pill {
          background: var(--brand-gold-glow);
          color: var(--brand-gold);
          font-size: 12px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: var(--radius-sm);
        }

        .etf-div-cards-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 12px;
        }

        .etf-card-item {
          background: var(--bg-surface-elevated);
          padding: 12px 14px;
          border-radius: var(--radius-md);
          display: flex;
          flex-direction: column;
        }

        .highlight-border {
          border: 1px solid var(--border-focus);
        }

        .etf-sub-label {
          font-size: 11px;
          color: var(--text-muted);
          margin-bottom: 4px;
        }

        .etf-big-num {
          font-size: 17px;
          font-weight: 800;
          color: var(--text-main);
        }

        .small-unit {
          font-size: 12px;
          font-weight: 500;
          color: var(--text-muted);
        }

        .text-gold {
          color: var(--brand-gold) !important;
        }

        .etf-date-val {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-main);
        }

        .yield-estimate-bar {
          background: var(--bg-surface-elevated);
          padding: 10px 14px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 13px;
        }

        /* 底部快捷按鈕 */
        .detail-bottom-actions {
          display: flex;
          gap: 12px;
          margin-top: 8px;
        }

        .trade-action-btn {
          flex: 1;
          height: 48px;
          font-size: 16px;
          color: #FFFFFF;
          gap: 6px;
        }

        .btn-buy-lg {
          background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
          box-shadow: 0 4px 14px rgba(239, 68, 68, 0.35);
        }

        .btn-sell-lg {
          background: linear-gradient(135deg, #10B981 0%, #059669 100%);
          box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);
        }
      `}</style>
    </div>
  );
};
