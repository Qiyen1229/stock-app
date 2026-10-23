import React from 'react';
import { Home, PieChart, ArrowLeftRight, Coins, Calculator } from 'lucide-react';

export type NavTab = 'dashboard' | 'holdings' | 'transactions' | 'dividends' | 'compound';

interface MobileBottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenNewTransaction: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onTabChange,
  onOpenNewTransaction,
}) => {
  const tabs = [
    { id: 'dashboard' as NavTab, label: '首頁', icon: Home },
    { id: 'holdings' as NavTab, label: '持倉', icon: PieChart },
    { id: 'transactions' as NavTab, label: '交易', icon: ArrowLeftRight },
    { id: 'dividends' as NavTab, label: '配息', icon: Coins },
    { id: 'compound' as NavTab, label: '複利', icon: Calculator },
  ];

  return (
    <nav className="mobile-bottom-nav">
      <div className="nav-items-wrapper">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`nav-tab-btn ${isActive ? 'active' : ''}`}
              aria-label={tab.label}
            >
              <div className="nav-icon-container">
                <Icon size={22} strokeWidth={isActive ? 2.4 : 1.8} />
              </div>
              <span className="nav-tab-label">{tab.label}</span>
              {isActive && <div className="active-dot" />}
            </button>
          );
        })}
      </div>

      <style>{`
        .mobile-bottom-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 90;
          background: var(--nav-bar-bg);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-top: 1px solid var(--border-subtle);
          /* iPhone Home Indicator safe-area-inset-bottom */
          padding-bottom: max(var(--safe-bottom), 8px);
          padding-top: 6px;
        }

        @media (min-width: 1024px) {
          .mobile-bottom-nav {
            display: none !important;
          }
        }

        .nav-items-wrapper {
          display: flex;
          align-items: center;
          justify-content: space-around;
          max-width: 600px;
          margin: 0 auto;
          height: 52px;
          padding: 0 4px;
        }

        .nav-tab-btn {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: none;
          border: none;
          padding: 4px 0;
          min-height: 48px;
          cursor: pointer;
          color: var(--text-secondary);
          transition: all var(--transition-fast);
          position: relative;
        }

        .nav-icon-container {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 24px;
        }

        .nav-tab-label {
          font-size: 11px;
          font-weight: 500;
          margin-top: 2px;
          letter-spacing: -0.2px;
        }

        .nav-tab-btn.active {
          color: var(--brand-primary);
        }

        .nav-tab-btn.active .nav-tab-label {
          font-weight: 700;
        }

        .active-dot {
          position: absolute;
          bottom: 0px;
          width: 4px;
          height: 4px;
          background-color: var(--brand-primary);
          border-radius: 50%;
        }
      `}</style>
    </nav>
  );
};
