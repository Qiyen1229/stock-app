import React, { useState, useEffect } from 'react';
import { X, Search, Check, AlertCircle } from 'lucide-react';
import { request } from '../api/client';
import { usePortfolio } from '../contexts/PortfolioContext';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSymbol?: string;
  initialType?: 'BUY' | 'SELL';
  editingId?: number;
}

interface SearchItem {
  symbol: string;
  name: string;
  market: string;
  defaultPrice?: number;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  initialSymbol = '',
  initialType = 'BUY',
  editingId,
}) => {
  const { refreshPortfolio } = usePortfolio();
  const [symbol, setSymbol] = useState(initialSymbol);
  const [stockName, setStockName] = useState('');
  const [type, setType] = useState<'BUY' | 'SELL'>(initialType);
  const [price, setPrice] = useState('');
  const [shares, setShares] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [fee, setFee] = useState('');
  const [tax, setTax] = useState('');
  const [notes, setNotes] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSymbol(initialSymbol);
      setType(initialType);
      setErrorMsg('');
      if (initialSymbol) {
        setSearchQuery(initialSymbol);
      }
    }
  }, [isOpen, initialSymbol, initialType]);

  // 股票即時搜尋
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const data = await request<{ results: SearchItem[] }>(`/stocks/search?q=${encodeURIComponent(searchQuery)}`);
        setSearchResults(data.results || []);
      } catch (err) {
        console.error('搜尋股票出錯:', err);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const [selectedMarket, setSelectedMarket] = useState('上市');

  // 元大證券手續費計算規則：
  // 1. 牌告費率 0.1425%
  // 2. 元大證券電子下單 6 折 (0.6)
  // 3. 每筆最低手續費 20 元 (若小額低於 20 元以 20 元計收)
  // 4. 賣出交易稅：個股 0.3%，ETF 優惠稅率 0.1%
  const handleAutoCalcTradingCost = (p: number, s: number, currentType: 'BUY' | 'SELL', market: string = selectedMarket) => {
    if (p > 0 && s > 0) {
      const gross = p * s;
      const yuantaFee = Math.max(20, Math.floor(gross * 0.001425 * 0.6));
      setFee(yuantaFee.toString());

      if (currentType === 'SELL') {
        const isEtf = market === 'ETF' || symbol.startsWith('00');
        const taxRate = isEtf ? 0.001 : 0.003;
        const estimatedTax = Math.floor(gross * taxRate);
        setTax(estimatedTax.toString());
      } else {
        setTax('0');
      }
    }
  };

  const handleSelectStock = (item: SearchItem) => {
    setSymbol(item.symbol);
    setStockName(item.name);
    setSelectedMarket(item.market);
    setSearchQuery(`${item.symbol} ${item.name}`);
    setShowSearchResults(false);
    // 使用者指定：不要有預設的買進單價，留給使用者自行輸入
    if (price && shares) {
      handleAutoCalcTradingCost(Number(price), Number(shares), type, item.market);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!symbol.trim()) {
      setErrorMsg('請輸入或選擇股票代號');
      return;
    }

    const numPrice = Number(price);
    const numShares = Number(shares);

    if (isNaN(numPrice) || numPrice <= 0) {
      setErrorMsg('價格必須大於 0');
      return;
    }

    if (isNaN(numShares) || numShares <= 0) {
      setErrorMsg('股數必須大於 0');
      return;
    }

    if (!date) {
      setErrorMsg('請選擇交易日期');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        symbol: symbol.trim().toUpperCase(),
        type,
        price: numPrice,
        shares: numShares,
        date,
        fee: Number(fee) || 0,
        tax: Number(tax) || 0,
        notes: notes.trim(),
      };

      if (editingId) {
        await request(`/transactions/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await request('/transactions', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }

      await refreshPortfolio(true);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || '儲存失敗，請檢查輸入內容');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="bottom-sheet-content" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* 手機底部拖曳握把 */}
        <div className="sheet-handle-bar" />

        {/* 頂部標題 */}
        <div className="modal-header">
          <h2 className="modal-title">{editingId ? '編輯交易明細' : '新增交易紀錄'}</h2>
          <button 
            type="button" 
            onClick={onClose} 
            className="close-btn"
            aria-label="關閉"
          >
            <X size={20} />
          </button>
        </div>

        {errorMsg && (
          <div className="error-alert">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-form">
          {/* 買入 / 賣出 分段切換 (iOS Segmented Control 風格) */}
          <div className="segmented-control">
            <button
              type="button"
              className={`segment-btn ${type === 'BUY' ? 'active-buy' : ''}`}
              onClick={() => {
                setType('BUY');
                if (price && shares) handleAutoCalcTradingCost(Number(price), Number(shares), 'BUY');
              }}
            >
              買入 (Buy)
            </button>
            <button
              type="button"
              className={`segment-btn ${type === 'SELL' ? 'active-sell' : ''}`}
              onClick={() => {
                setType('SELL');
                if (price && shares) handleAutoCalcTradingCost(Number(price), Number(shares), 'SELL');
              }}
            >
              賣出 (Sell)
            </button>
          </div>

          {/* 股票搜尋輸入欄 */}
          <div className="form-group relative">
            <label className="input-label">股票標的 / 代號</label>
            <div className="search-input-box">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="輸入代號 (例如 2330 或 0056)"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSymbol(e.target.value);
                  setShowSearchResults(true);
                }}
                onFocus={() => setShowSearchResults(true)}
                autoComplete="off"
              />
            </div>

            {/* 搜尋下拉清單 */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="search-dropdown glass-card">
                {searchResults.map((item) => (
                  <div
                    key={item.symbol}
                    className="search-result-row"
                    onClick={() => handleSelectStock(item)}
                  >
                    <span className="res-sym">{item.symbol}</span>
                    <span className="res-name">{item.name}</span>
                    <span className="res-market">{item.market}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 價格與股數 (配備 numeric / decimal keyboard) */}
          <div className="form-row-2">
            <div className="form-group">
              <label className="input-label">
                {type === 'BUY' ? '買進單價 (NT$)' : '賣出單價 (NT$)'}
              </label>
              <input
                type="number"
                step="any"
                inputMode="decimal"
                pattern="[0-9]*"
                placeholder="0.00"
                value={price}
                onChange={(e) => {
                  setPrice(e.target.value);
                  handleAutoCalcTradingCost(Number(e.target.value), Number(shares), type);
                }}
                required
              />
            </div>

            <div className="form-group">
              <label className="input-label">交易股數 (股)</label>
              <input
                type="number"
                step="1"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="例如 1000"
                value={shares}
                onChange={(e) => {
                  setShares(e.target.value);
                  handleAutoCalcTradingCost(Number(price), Number(e.target.value), type);
                }}
                required
              />
            </div>
          </div>

          {/* 交易日期 */}
          <div className="form-group">
            <label className="input-label">交易日期</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          {/* 手續費與交易稅 (依照元大證券規則試算) */}
          <div className="form-row-2">
            <div className="form-group">
              <label className="input-label">手續費 (NT$) <span className="sub-hint">(元大6折,低消20)</span></label>
              <input
                type="number"
                inputMode="numeric"
                value={fee}
                onChange={(e) => setFee(e.target.value)}
                placeholder="依元大證券自動試算"
              />
            </div>

            <div className="form-group">
              <label className="input-label">交易稅 (NT$) <span className="sub-hint">(賣出ETF 0.1%/個股0.3%)</span></label>
              <input
                type="number"
                inputMode="numeric"
                value={tax}
                onChange={(e) => setTax(e.target.value)}
                placeholder="賣出時自動試算"
              />
            </div>
          </div>

          {/* 備註 */}
          <div className="form-group">
            <label className="input-label">備註 (選填)</label>
            <input
              type="text"
              placeholder="例如：定期定額、加碼分批"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* 底部確認按鈕 */}
          <div className="form-submit-row">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`touch-btn submit-btn ${type === 'BUY' ? 'btn-buy' : 'btn-sell'}`}
            >
              {isSubmitting ? '儲存中...' : editingId ? '確認儲存修改' : type === 'BUY' ? '確認新增買進' : '確認新增賣出'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 100;
          background: rgba(0, 0, 0, 0.65);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }

        @media (min-width: 640px) {
          .modal-backdrop {
            align-items: center;
            padding: 20px;
          }
        }

        .bottom-sheet-content {
          background: var(--bg-surface);
          width: 100%;
          max-width: 520px;
          border-top-left-radius: var(--radius-xl);
          border-top-right-radius: var(--radius-xl);
          padding: 12px 20px;
          padding-bottom: max(var(--safe-bottom), 24px);
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.4);
          animation: slideUp 0.22s ease-out;
        }

        @media (min-width: 640px) {
          .bottom-sheet-content {
            border-radius: var(--radius-xl);
            padding-bottom: 24px;
            animation: zoomIn 0.2s ease-out;
          }
        }

        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }

        @keyframes zoomIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }

        .sheet-handle-bar {
          width: 44px;
          height: 5px;
          background: var(--border-focus);
          border-radius: 9999px;
          margin: 0 auto 10px auto;
        }

        @media (min-width: 640px) {
          .sheet-handle-bar {
            display: none;
          }
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .modal-title {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-main);
        }

        .close-btn {
          background: var(--bg-surface-elevated);
          border: none;
          color: var(--text-secondary);
          width: 34px;
          height: 34px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .error-alert {
          background: var(--tw-up-bg);
          color: var(--tw-up);
          padding: 8px 12px;
          border-radius: var(--radius-md);
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 12px;
        }

        .modal-form {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .segmented-control {
          display: flex;
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-subtle);
          padding: 4px;
          border-radius: var(--radius-md);
          gap: 4px;
        }

        .segment-btn {
          flex: 1;
          border: none;
          background: none;
          padding: 8px 0;
          font-size: 14px;
          font-weight: 600;
          color: var(--text-secondary);
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .segment-btn.active-buy {
          background: var(--tw-up);
          color: #FFFFFF;
          box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
        }

        .segment-btn.active-sell {
          background: var(--tw-down);
          color: #FFFFFF;
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          position: relative;
        }

        .input-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .search-input-box {
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

        .search-input-box input {
          padding-left: 38px;
        }

        .search-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          margin-top: 4px;
          max-height: 200px;
          overflow-y: auto;
          z-index: 120;
          border: 1px solid var(--border-focus);
        }

        .search-result-row {
          padding: 10px 14px;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          border-bottom: 1px solid var(--border-subtle);
        }

        .search-result-row:hover {
          background: var(--bg-surface-elevated);
        }

        .res-sym {
          font-weight: 700;
          color: var(--brand-primary);
        }

        .res-name {
          flex: 1;
          color: var(--text-main);
          font-weight: 500;
        }

        .res-market {
          font-size: 11px;
          color: var(--text-muted);
          background: var(--bg-surface-elevated);
          padding: 2px 6px;
          border-radius: 4px;
        }

        .form-row-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .form-submit-row {
          margin-top: 8px;
        }

        .submit-btn {
          width: 100%;
          height: 48px;
          font-size: 16px;
          color: #FFFFFF;
        }

        .btn-buy {
          background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
          box-shadow: 0 4px 14px rgba(239, 68, 68, 0.35);
        }

        .btn-sell {
          background: linear-gradient(135deg, #10B981 0%, #059669 100%);
          box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);
        }
      `}</style>
    </div>
  );
};
