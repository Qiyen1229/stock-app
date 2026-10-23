import React from 'react';
import { 
  RefreshCw, 
  Sun, 
  Moon, 
  LogOut, 
  WifiOff, 
  Sparkles, 
  CheckCircle2, 
  TrendingUp,
  Download
} from 'lucide-react';
import { usePortfolio } from '../contexts/PortfolioContext';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { NavTab } from './MobileBottomNav';

interface HeaderProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange }) => {
  const { 
    isRefreshing, 
    refreshPortfolio, 
    showUpdateToast, 
    isOffline, 
    hasAppUpdate, 
    applyAppUpdate,
    lastUpdated 
  } = usePortfolio();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  const navLinks = [
    { id: 'dashboard' as NavTab, label: '首頁' },
    { id: 'holdings' as NavTab, label: '股票持倉' },
    { id: 'transactions' as NavTab, label: '交易明細' },
    { id: 'dividends' as NavTab, label: 'ETF 配息中心' },
    { id: 'compound' as NavTab, label: '定期定額複利' },
  ];

  return (
    <header className="site-header">
      <div className="header-container">
        {/* 左側：品牌 Logo 與標題 */}
        <div className="brand-section" onClick={() => onTabChange('dashboard')}>
          <div className="brand-icon-wrapper">
            <TrendingUp size={22} className="brand-icon" />
          </div>
          <div className="brand-text">
            <h1 className="brand-title">我的股票</h1>
            <span className="brand-subtitle">
              {lastUpdated ? `最後更新 ${lastUpdated}` : '即時台股資產管理'}
            </span>
          </div>
        </div>

        {/* 中間：桌面版選單 */}
        <nav className="desktop-nav">
          {navLinks.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`desktop-nav-link ${activeTab === item.id ? 'active' : ''}`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* 右側：一鍵整理、5 秒限時提示、主題切換、登出 */}
        <div className="actions-section">
          {/* 限時 5 秒的「已更新資料」提示 (出現在一鍵整理按鈕左側) */}
          {showUpdateToast && (
            <div className="update-toast animate-fade-in">
              <CheckCircle2 size={16} />
              <span>已更新資料</span>
            </div>
          )}

          {/* 一鍵整理按鈕 */}
          <button
            onClick={() => refreshPortfolio(true)}
            disabled={isRefreshing}
            className={`action-btn refresh-btn ${isRefreshing ? 'rotating' : ''}`}
            title="一鍵獲取最新行情"
            aria-label="一鍵整理"
          >
            <RefreshCw size={18} />
            <span className="btn-label-desktop">一鍵整理</span>
          </button>

          {/* 深淺色模式切換 */}
          <button
            onClick={toggleTheme}
            className="action-btn icon-only"
            title={`切換為${theme === 'dark' ? '淺色' : '深色'}模式`}
            aria-label="主題切換"
          >
            {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
          </button>

          {/* 使用者資訊與登出 */}
          {user && (
            <div className="user-section">
              <span className="user-name-badge nowrap">{user.username}</span>
              <button
                onClick={logout}
                className="action-btn icon-only logout-btn"
                title="登出帳號"
                aria-label="登出"
              >
                <LogOut size={17} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 離線狀態橫幅提示 */}
      {isOffline && (
        <div className="offline-banner">
          <WifiOff size={16} />
          <span>目前離線，行情資料可能不是最新。恢復連線後將自動同步。</span>
        </div>
      )}

      {/* PWA 版本更新提示 */}
      {hasAppUpdate && (
        <div className="update-banner">
          <div className="update-banner-content">
            <Sparkles size={16} />
            <span>發現新版本系統！點擊立即套用新版本</span>
          </div>
          <button onClick={applyAppUpdate} className="update-action-btn">
            重新載入
          </button>
        </div>
      )}

      <style>{`
        .site-header {
          position: sticky;
          top: 0;
          z-index: 80;
          background: var(--nav-bar-bg);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border-subtle);
          padding-top: var(--safe-top);
        }

        .header-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 10px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 60px;
        }

        .brand-section {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          user-select: none;
        }

        .brand-icon-wrapper {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-md);
          background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #FFFFFF;
          box-shadow: 0 2px 8px var(--brand-glow);
        }

        .brand-title {
          font-size: 17px;
          font-weight: 700;
          letter-spacing: -0.3px;
          line-height: 1.2;
          color: var(--text-main);
        }

        .brand-subtitle {
          font-size: 11px;
          color: var(--text-muted);
          display: block;
        }

        .desktop-nav {
          display: none;
          align-items: center;
          gap: 6px;
        }

        @media (min-width: 1024px) {
          .desktop-nav {
            display: flex;
          }
        }

        .desktop-nav-link {
          background: none;
          border: none;
          color: var(--text-secondary);
          font-size: 14px;
          font-weight: 500;
          padding: 8px 14px;
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .desktop-nav-link:hover {
          color: var(--text-main);
          background: var(--bg-surface-elevated);
        }

        .desktop-nav-link.active {
          color: var(--brand-primary);
          background: var(--bg-surface-elevated);
          font-weight: 600;
        }

        .actions-section {
          display: flex;
          align-items: center;
          gap: 8px;
          position: relative;
        }

        .update-toast {
          background: #10B981;
          color: #FFFFFF;
          font-size: 13px;
          font-weight: 600;
          padding: 6px 12px;
          border-radius: 9999px;
          display: flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.35);
        }

        .animate-fade-in {
          animation: fadeIn 0.25s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(8px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .action-btn {
          min-height: 38px;
          height: 38px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0 12px;
          border-radius: var(--radius-md);
          background-color: var(--bg-surface-elevated);
          border: 1px solid var(--border-subtle);
          color: var(--text-main);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .action-btn:active {
          transform: scale(0.96);
        }

        .action-btn.icon-only {
          width: 38px;
          padding: 0;
        }

        .refresh-btn {
          gap: 6px;
          color: var(--brand-primary);
        }

        .btn-label-desktop {
          display: none;
        }

        @media (min-width: 640px) {
          .btn-label-desktop {
            display: inline;
          }
        }

        .rotating svg {
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          100% { transform: rotate(360deg); }
        }

        .user-section {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-left: 4px;
        }

        .user-name-badge {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
          background: var(--bg-surface-elevated);
          padding: 4px 8px;
          border-radius: var(--radius-sm);
          display: none;
        }

        @media (min-width: 768px) {
          .user-name-badge {
            display: inline-block;
          }
        }

        .offline-banner {
          background-color: #F59E0B;
          color: #000000;
          font-size: 12px;
          font-weight: 600;
          padding: 6px 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .update-banner {
          background: linear-gradient(90deg, #2563EB, #1D4ED8);
          color: #FFFFFF;
          padding: 8px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 13px;
          font-weight: 600;
        }

        .update-banner-content {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .update-action-btn {
          background: #FFFFFF;
          color: #1D4ED8;
          border: none;
          font-size: 12px;
          font-weight: 700;
          padding: 4px 12px;
          border-radius: 9999px;
          cursor: pointer;
        }
      `}</style>
    </header>
  );
};
