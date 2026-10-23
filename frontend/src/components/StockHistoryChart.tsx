import React, { useState, useRef } from 'react';
import { formatStockPrice } from '../utils/formatters';

export interface ChartPoint {
  date: string;
  price: number;
}

interface StockHistoryChartProps {
  data: ChartPoint[];
  timeframe: string;
  onTimeframeChange: (tf: string) => void;
  isLoading?: boolean;
}

export const StockHistoryChart: React.FC<StockHistoryChartProps> = ({
  data,
  timeframe,
  onTimeframeChange,
  isLoading = false,
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const timeframes = ['1D', '1W', '1M', '3M', '6M', '1Y'];

  if (!data || data.length === 0) {
    return <div className="chart-empty">暫無圖表數據</div>;
  }

  const prices = data.map((d) => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const range = maxPrice - minPrice || 1;

  // 圖表內部尺寸 (寬 500, 高 220, 留下上下邊距)
  const svgWidth = 500;
  const svgHeight = 220;
  const paddingX = 15;
  const paddingTop = 20;
  const paddingBottom = 30;
  const chartHeight = svgHeight - paddingTop - paddingBottom;
  const chartWidth = svgWidth - paddingX * 2;

  // 計算座標
  const points = data.map((d, index) => {
    const x = paddingX + (index / (data.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - ((d.price - minPrice) / range) * chartHeight;
    return { x, y, ...d };
  });

  // 折線路徑與填充區域路徑
  const pathD = points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`, '');
  const areaD = `${pathD} L ${points[points.length - 1].x.toFixed(1)} ${(paddingTop + chartHeight).toFixed(1)} L ${points[0].x.toFixed(1)} ${(paddingTop + chartHeight).toFixed(1)} Z`;

  // 判斷趨勢（漲/跌顏色）
  const isUp = points[points.length - 1]?.price >= points[0]?.price;
  const strokeColor = isUp ? 'var(--tw-up)' : 'var(--tw-down)';
  const gradId = isUp ? 'chartGradUp' : 'chartGradDown';

  // 觸控與滑鼠互動
  const handleInteraction = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const index = Math.round(ratio * (data.length - 1));
    setHoverIndex(index);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      handleInteraction(e.touches[0].clientX);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleInteraction(e.clientX);
  };

  const activePoint = hoverIndex !== null && points[hoverIndex] ? points[hoverIndex] : points[points.length - 1];

  return (
    <div className="stock-chart-wrapper">
      {/* 頂部：當前選中價格與日期顯示 */}
      <div className="chart-active-info">
        <span className="active-price nowrap">{formatStockPrice(activePoint.price)}</span>
        <span className="active-date">{activePoint.date}</span>
      </div>

      {/* 時間區間切換按鈕 (1D, 1W, 1M, 3M, 6M, 1Y) */}
      <div className="timeframe-selector">
        {timeframes.map((tf) => (
          <button
            key={tf}
            type="button"
            className={`tf-btn ${timeframe === tf ? 'active' : ''}`}
            onClick={() => onTimeframeChange(tf)}
          >
            {tf}
          </button>
        ))}
      </div>

      {/* 響應式 SVG 圖表容器 */}
      <div
        ref={containerRef}
        className="chart-svg-container"
        onTouchMove={handleTouchMove}
        onTouchEnd={() => setHoverIndex(null)}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverIndex(null)}
      >
        {isLoading && <div className="chart-loading-overlay">更新中...</div>}
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="chart-svg"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="chartGradUp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#EF4444" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#EF4444" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="chartGradDown" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* 水平格線 */}
          <line
            x1={paddingX}
            y1={paddingTop}
            x2={svgWidth - paddingX}
            y2={paddingTop}
            stroke="var(--border-subtle)"
            strokeDasharray="4 4"
          />
          <line
            x1={paddingX}
            y1={paddingTop + chartHeight / 2}
            x2={svgWidth - paddingX}
            y2={paddingTop + chartHeight / 2}
            stroke="var(--border-subtle)"
            strokeDasharray="4 4"
          />
          <line
            x1={paddingX}
            y1={paddingTop + chartHeight}
            x2={svgWidth - paddingX}
            y2={paddingTop + chartHeight}
            stroke="var(--border-subtle)"
          />

          {/* 填充面積 */}
          <path d={areaD} fill={`url(#${gradId})`} />

          {/* 折線 */}
          <path
            d={pathD}
            fill="none"
            stroke={strokeColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* 互動游標 (Crosshair) */}
          {activePoint && (
            <g>
              <line
                x1={activePoint.x}
                y1={paddingTop}
                x2={activePoint.x}
                y2={paddingTop + chartHeight}
                stroke="var(--text-muted)"
                strokeDasharray="2 2"
                strokeWidth="1.2"
              />
              <circle
                cx={activePoint.x}
                cy={activePoint.y}
                r="5"
                fill={strokeColor}
                stroke="var(--bg-surface)"
                strokeWidth="2"
              />
            </g>
          )}

          {/* 底部時間標註 */}
          <text
            x={paddingX}
            y={svgHeight - 8}
            fill="var(--chart-text)"
            fontSize="10"
            fontWeight="500"
          >
            {points[0]?.date}
          </text>
          <text
            x={svgWidth - paddingX}
            y={svgHeight - 8}
            fill="var(--chart-text)"
            fontSize="10"
            fontWeight="500"
            textAnchor="end"
          >
            {points[points.length - 1]?.date}
          </text>
        </svg>
      </div>

      <style>{`
        .stock-chart-wrapper {
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100%;
          overflow: hidden;
        }

        .chart-active-info {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          padding: 0 4px;
        }

        .active-price {
          font-size: 24px;
          font-weight: 800;
          color: var(--text-main);
          letter-spacing: -0.5px;
        }

        .active-date {
          font-size: 13px;
          color: var(--text-muted);
          font-weight: 600;
        }

        .timeframe-selector {
          display: flex;
          background: var(--bg-surface-elevated);
          padding: 4px;
          border-radius: var(--radius-md);
          gap: 4px;
          justify-content: space-between;
        }

        .tf-btn {
          flex: 1;
          border: none;
          background: none;
          color: var(--text-secondary);
          font-size: 13px;
          font-weight: 600;
          padding: 6px 0;
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .tf-btn.active {
          background: var(--bg-surface);
          color: var(--brand-primary);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
          font-weight: 700;
        }

        .chart-svg-container {
          position: relative;
          width: 100%;
          height: 200px;
          touch-action: none;
          cursor: crosshair;
        }

        .chart-svg {
          width: 100%;
          height: 100%;
          display: block;
        }

        .chart-empty {
          height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          font-size: 14px;
        }

        .chart-loading-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-main);
          font-size: 12px;
          backdrop-filter: blur(2px);
          border-radius: var(--radius-md);
        }
      `}</style>
    </div>
  );
};
