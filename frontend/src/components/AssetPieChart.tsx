import React from 'react';
import { formatCurrency } from '../utils/formatters';

interface AllocationItem {
  name: string;
  value: number;
  ratio: number;
}

interface AssetPieChartProps {
  allocation: AllocationItem[];
  totalMarketValue: number;
}

export const AssetPieChart: React.FC<AssetPieChartProps> = ({ allocation, totalMarketValue }) => {
  if (!allocation || allocation.length === 0 || totalMarketValue === 0) {
    return (
      <div className="pie-empty-box">
        <span>尚無資產配置數據</span>
      </div>
    );
  }

  // 顏色配置：個股 (科技藍), ETF (金融金), 其他
  const colors = ['#3B82F6', '#F59E0B', '#10B981', '#8B5CF6'];

  // 環形圖 SVG 參數
  const size = 160;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <div className="asset-pie-widget">
      <div className="donut-chart-container">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="donut-svg">
          {/* 背景底環 */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="var(--bg-surface-elevated)"
            strokeWidth={strokeWidth}
          />

          {/* 各配置比例弧段 */}
          {allocation.map((item, index) => {
            const strokeDashoffset = circumference - (item.ratio / 100) * circumference;
            const rotation = (accumulatedPercent / 100) * 360 - 90;
            accumulatedPercent += item.ratio;

            return (
              <circle
                key={item.name}
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={colors[index % colors.length]}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                transform={`rotate(${rotation} ${center} ${center})`}
                strokeLinecap="round"
                className="donut-segment"
              />
            );
          })}
        </svg>

        {/* 中心文字：清晰對比 */}
        <div className="donut-center-info">
          <span className="donut-center-label">總市值</span>
          <span className="donut-center-value nowrap">{formatCurrency(totalMarketValue)}</span>
        </div>
      </div>

      {/* 右側 / 下方比例圖例 */}
      <div className="donut-legend-list">
        {allocation.map((item, index) => (
          <div key={item.name} className="legend-row">
            <div className="legend-marker-name">
              <span
                className="color-dot"
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              <span className="legend-name nowrap">{item.name}</span>
            </div>
            <div className="legend-values">
              <span className="legend-ratio nowrap">{item.ratio}%</span>
              <span className="legend-amount nowrap">{formatCurrency(item.value)}</span>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .asset-pie-widget {
          display: flex;
          align-items: center;
          gap: 32px;
          flex-wrap: wrap;
          padding: 8px 0;
        }

        .donut-chart-container {
          position: relative;
          width: 160px;
          height: 160px;
          flex-shrink: 0;
        }

        @media (max-width: 640px) {
          .donut-chart-container {
            margin: 0 auto;
          }
        }

        .donut-svg {
          transform: rotate(0deg);
        }

        .donut-segment {
          transition: stroke-dashoffset 0.6s ease;
        }

        .donut-center-info {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          text-align: center;
        }

        .donut-center-label {
          font-size: 11px;
          color: var(--text-muted);
          font-weight: 600;
        }

        .donut-center-value {
          font-size: 13px;
          font-weight: 800;
          color: var(--text-main);
          max-width: 100px;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .donut-legend-list {
          flex: 1;
          min-width: 140px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .legend-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 13px;
        }

        .legend-marker-name {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .color-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .legend-name {
          font-weight: 600;
          color: var(--text-main);
        }

        .legend-values {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        .legend-ratio {
          font-weight: 700;
          color: var(--text-main);
        }

        .legend-amount {
          font-size: 11px;
          color: var(--text-muted);
        }

        .pie-empty-box {
          padding: 24px;
          text-align: center;
          color: var(--text-muted);
          font-size: 13px;
        }
      `}</style>
    </div>
  );
};
