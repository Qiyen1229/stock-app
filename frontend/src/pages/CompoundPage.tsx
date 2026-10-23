import React, { useState, useEffect } from 'react';
import { Calculator, TrendingUp, Sparkles, Save, Check } from 'lucide-react';
import { request } from '../api/client';
import { formatCurrency, formatPercent } from '../utils/formatters';

type FrequencyType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

interface YearBreakdown {
  year: number;
  totalPrincipal: number;
  totalInterest: number;
  totalAsset: number;
  roi: number;
}

export const CompoundPage: React.FC = () => {
  const [frequency, setFrequency] = useState<FrequencyType>('MONTHLY');
  const [periodicAmount, setPeriodicAmount] = useState('15000');
  const [initialAmount, setInitialAmount] = useState('0');
  const [annualRate, setAnnualRate] = useState('8.0');
  const [years, setYears] = useState('10');

  const [result, setResult] = useState<{
    totalPrincipal: number;
    totalProfit: number;
    finalAsset: number;
    totalRoi: number;
    yearlyBreakdown: YearBreakdown[];
  } | null>(null);

  const [isSaved, setIsSaved] = useState(false);

  // 讀取遠端使用者儲存的複利設定
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await request<{ settings: any }>('/compound/settings');
        if (res.settings) {
          setFrequency(res.settings.frequency || 'MONTHLY');
          setPeriodicAmount(res.settings.periodic_amount.toString());
          setInitialAmount(res.settings.initial_amount.toString());
          setAnnualRate(res.settings.annual_rate.toString());
          setYears(res.settings.years.toString());
        }
      } catch (e) {
        // 使用預設值
      }
    };
    loadSettings();
  }, []);

  // 當數值變更時自動重新運算複利
  useEffect(() => {
    const runCalculation = async () => {
      try {
        const res = await request<{ result: any }>('/compound/calculate', {
          method: 'POST',
          body: JSON.stringify({
            frequency,
            periodicAmount: Number(periodicAmount) || 0,
            initialAmount: Number(initialAmount) || 0,
            annualRate: Number(annualRate) || 0,
            years: Number(years) || 10,
          }),
        });
        setResult(res.result);
      } catch (err) {
        console.error('計算複利出錯:', err);
      }
    };
    runCalculation();
  }, [frequency, periodicAmount, initialAmount, annualRate, years]);

  // 儲存偏好
  const handleSaveSettings = async () => {
    try {
      await request('/compound/settings', {
        method: 'POST',
        body: JSON.stringify({
          frequency,
          periodicAmount: Number(periodicAmount),
          initialAmount: Number(initialAmount),
          annualRate: Number(annualRate),
          years: Number(years),
        }),
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (e) {
      console.error('儲存失敗:', e);
    }
  };

  const frequencyOptions: { id: FrequencyType; label: string }[] = [
    { id: 'DAILY', label: '每日投入' },
    { id: 'WEEKLY', label: '每週投入' },
    { id: 'MONTHLY', label: '每月投入' },
    { id: 'YEARLY', label: '每年投入' },
  ];

  const quickYears = [1, 5, 10, 20, 30];

  const breakdown = result?.yearlyBreakdown || [];
  const maxAsset = result?.finalAsset || 1;

  return (
    <div className="compound-page">
      {/* 標題與簡介 */}
      <div className="page-header-row">
        <div className="title-group">
          <Calculator size={22} className="brand-accent" />
          <h1 className="main-title">定期定額複利計算器</h1>
        </div>

        <button 
          onClick={handleSaveSettings} 
          className="save-pref-btn touch-btn"
          title="儲存為個人偏好"
        >
          {isSaved ? <Check size={16} /> : <Save size={16} />}
          <span>{isSaved ? '已儲存偏好' : '儲存偏好'}</span>
        </button>
      </div>

      {/* 參數輸入面板 */}
      <section className="inputs-card glass-card">
        {/* 頻率切換 (日 / 週 / 月 / 年) */}
        <div className="frequency-selector">
          {frequencyOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={`freq-btn ${frequency === opt.id ? 'active' : ''}`}
              onClick={() => setFrequency(opt.id)}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="input-grid-2">
          <div className="input-field">
            <label className="field-label">每次投入金額 (NT$)</label>
            <input
              type="number"
              inputMode="numeric"
              value={periodicAmount}
              onChange={(e) => setPeriodicAmount(e.target.value)}
              placeholder="15000"
            />
          </div>

          <div className="input-field">
            <label className="field-label">初始本金 (NT$)</label>
            <input
              type="number"
              inputMode="numeric"
              value={initialAmount}
              onChange={(e) => setInitialAmount(e.target.value)}
              placeholder="0"
            />
          </div>

          <div className="input-field">
            <label className="field-label">預估年化報酬率 (%)</label>
            <input
              type="number"
              step="0.1"
              inputMode="decimal"
              value={annualRate}
              onChange={(e) => setAnnualRate(e.target.value)}
              placeholder="8.0"
            />
          </div>

          <div className="input-field">
            <label className="field-label">投資年數 (年)</label>
            <input
              type="number"
              inputMode="numeric"
              value={years}
              onChange={(e) => setYears(e.target.value)}
              placeholder="10"
            />
          </div>
        </div>

        {/* 快速年數切換按鈕 */}
        <div className="quick-years-row">
          <span className="quick-label">快速年數：</span>
          <div className="quick-pills">
            {quickYears.map((y) => (
              <button
                key={y}
                type="button"
                className={`quick-pill ${years === y.toString() ? 'active' : ''}`}
                onClick={() => setYears(y.toString())}
              >
                {y} 年
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 成果摘要卡片 */}
      {result && (
        <section className="result-hero-card glass-card">
          <div className="result-top">
            <span className="result-label">投資 {years} 年後最終資產預估</span>
            <span className="result-roi-badge nowrap">總報酬率 +{result.totalRoi}%</span>
          </div>

          <div className="final-asset-val nowrap">
            {formatCurrency(result.finalAsset)}
          </div>

          <div className="result-metrics-grid">
            <div className="r-item">
              <span className="r-label">累計總投入本金</span>
              <span className="r-num text-principal nowrap">{formatCurrency(result.totalPrincipal)}</span>
            </div>

            <div className="r-item right">
              <span className="r-label">預估投資淨獲利</span>
              <span className="r-num text-profit nowrap">+{formatCurrency(result.totalProfit)}</span>
            </div>
          </div>
        </section>
      )}

      {/* 資產幾何增長趨勢圖 (本金 vs 總資產) - 專門優化暗色模式文字清晰 */}
      {breakdown.length > 0 && (
        <section className="growth-chart-card glass-card">
          <div className="growth-head">
            <div className="growth-title-group">
              <TrendingUp size={18} className="brand-accent" />
              <h2 className="section-title">資產幾何增長趨勢 (本金 vs 總資產)</h2>
            </div>
            <div className="chart-legend">
              <span className="legend-item"><span className="dot dot-principal" /> 本金</span>
              <span className="legend-item"><span className="dot dot-asset" /> 總資產 (含複利)</span>
            </div>
          </div>

          {/* 直觀條形幾何增長圖 */}
          <div className="growth-bars-list">
            {breakdown.map((row) => {
              const principalPercent = (row.totalPrincipal / maxAsset) * 100;
              const assetPercent = (row.totalAsset / maxAsset) * 100;

              return (
                <div key={row.year} className="growth-row">
                  <div className="year-label-col">第 {row.year} 年</div>

                  <div className="bar-track-col">
                    <div 
                      className="growth-bar-asset"
                      style={{ width: `${Math.min(100, Math.max(4, assetPercent))}%` }}
                    >
                      <div 
                        className="growth-bar-principal"
                        style={{ width: `${Math.min(100, (row.totalPrincipal / row.totalAsset) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="growth-vals-col">
                    <span className="asset-text nowrap">{formatCurrency(row.totalAsset)}</span>
                    <span className="roi-text nowrap">+{row.roi}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <style>{`
        .compound-page {
          max-width: 900px;
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

        .page-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .title-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .main-title {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-main);
        }

        .save-pref-btn {
          height: 36px;
          padding: 0 12px;
          font-size: 13px;
          gap: 6px;
          background: var(--bg-surface-elevated);
          color: var(--text-main);
          border: 1px solid var(--border-subtle);
        }

        .inputs-card {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .frequency-selector {
          display: flex;
          background: var(--bg-surface-elevated);
          padding: 4px;
          border-radius: var(--radius-md);
          gap: 4px;
        }

        .freq-btn {
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

        .freq-btn.active {
          background: var(--bg-surface);
          color: var(--brand-primary);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
          font-weight: 700;
        }

        .input-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        .input-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .field-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .quick-years-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding-top: 4px;
        }

        .quick-label {
          font-size: 12px;
          color: var(--text-muted);
          font-weight: 500;
        }

        .quick-pills {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        .quick-pill {
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-subtle);
          color: var(--text-main);
          font-size: 12px;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 9999px;
          cursor: pointer;
        }

        .quick-pill.active {
          background: var(--brand-primary);
          color: #FFFFFF;
          border-color: var(--brand-primary);
        }

        /* 結果卡片 */
        .result-hero-card {
          padding: 22px;
          background: linear-gradient(145deg, var(--bg-surface) 0%, var(--bg-surface-elevated) 100%);
        }

        .result-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .result-label {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .result-roi-badge {
          background: var(--tw-up-bg);
          color: var(--tw-up);
          font-size: 13px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: var(--radius-sm);
        }

        .final-asset-val {
          font-size: 34px;
          font-weight: 800;
          color: var(--text-main);
          letter-spacing: -0.6px;
          margin-bottom: 16px;
        }

        .result-metrics-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          padding-top: 14px;
          border-top: 1px solid var(--border-subtle);
        }

        .r-item {
          display: flex;
          flex-direction: column;
        }

        .r-item.right {
          align-items: flex-end;
          text-align: right;
        }

        .r-label {
          font-size: 11px;
          color: var(--text-muted);
          margin-bottom: 2px;
        }

        .r-num {
          font-size: 17px;
          font-weight: 700;
        }

        .text-principal {
          color: var(--brand-primary);
        }

        .text-profit {
          color: var(--tw-up);
        }

        /* 增長條形圖 */
        .growth-chart-card {
          padding: 20px;
        }

        .growth-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
          flex-wrap: wrap;
          gap: 8px;
        }

        .growth-title-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .section-title {
          font-size: 16px;
          font-weight: 700;
          color: var(--text-main);
        }

        .chart-legend {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 12px;
          color: var(--text-secondary);
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .dot {
          width: 8px;
          height: 8px;
          border-radius: 2px;
        }

        .dot-principal {
          background: #3B82F6;
        }

        .dot-asset {
          background: #10B981;
        }

        .growth-bars-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .growth-row {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
        }

        .year-label-col {
          width: 65px;
          font-weight: 600;
          color: var(--text-secondary);
          flex-shrink: 0;
        }

        .bar-track-col {
          flex: 1;
          height: 18px;
          background: var(--bg-surface-elevated);
          border-radius: 4px;
          position: relative;
          overflow: hidden;
        }

        .growth-bar-asset {
          height: 100%;
          background: #10B981;
          border-radius: 4px;
          position: relative;
          overflow: hidden;
          transition: width 0.4s ease;
        }

        .growth-bar-principal {
          height: 100%;
          background: #3B82F6;
          border-radius: 4px;
          position: absolute;
          left: 0;
          top: 0;
        }

        .growth-vals-col {
          width: 130px;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          flex-shrink: 0;
        }

        .asset-text {
          font-weight: 700;
          color: var(--text-main);
          font-size: 13px;
        }

        .roi-text {
          font-size: 10px;
          font-weight: 600;
          color: var(--tw-up);
        }
      `}</style>
    </div>
  );
};
