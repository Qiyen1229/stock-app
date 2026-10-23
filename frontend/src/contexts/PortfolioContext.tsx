import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { request } from '../api/client';
import { useAuth } from './AuthContext';

export interface HoldingItem {
  symbol: string;
  name: string;
  market: '上市' | '上櫃' | 'ETF';
  industry?: string;
  shares: number;
  avgCost: number;
  totalCost: number; // 投資成本
  currentPrice: number;
  marketValue: number;
  unrealizedProfit: number;
  profitRate: number;
  todayChange: number;
  todayChangePercent: number;
  todayProfit: number;
  portfolioRatio: number;
  updatedAt: string;
  status: string;
}

export interface PortfolioSummary {
  totalCost: number;          // 總投入成本 (投資成本)
  totalMarketValue: number;   // 目前總市值 (總資產)
  totalProfit: number;        // 總損益
  totalProfitRate: number;    // 總損益率 (%)
  todayProfit: number;        // 今日總損益
  stockCount: number;         // 股票持倉數
  etfCount: number;           // ETF 持倉數
  allocation: {
    name: string;
    value: number;
    ratio: number;
  }[];
}

interface PortfolioContextType {
  summary: PortfolioSummary | null;
  holdings: HoldingItem[];
  isLoading: boolean;
  isRefreshing: boolean;
  isOffline: boolean;
  lastUpdated: string | null;
  showUpdateToast: boolean;
  hasAppUpdate: boolean;
  refreshPortfolio: (manual?: boolean) => Promise<void>;
  applyAppUpdate: () => void;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [holdings, setHoldings] = useState<HoldingItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [showUpdateToast, setShowUpdateToast] = useState(false);
  const [hasAppUpdate, setHasAppUpdate] = useState(false);

  // 取得資產與持倉
  const fetchPortfolio = useCallback(async (isManual: boolean = false) => {
    if (!isAuthenticated) return;

    if (isManual) {
      setIsRefreshing(true);
    } else if (!summary) {
      setIsLoading(true);
    }

    try {
      const data = await request<{ summary: PortfolioSummary; holdings: HoldingItem[] }>('/portfolio');
      setSummary(data.summary);
      setHoldings(data.holdings);
      setLastUpdated(new Date().toLocaleTimeString('zh-TW', { hour12: false, hour: '2-digit', minute: '2-digit' }));

      // 若手動刷新，跳出限時 5 秒的「已更新資料」提示
      if (isManual) {
        setShowUpdateToast(true);
        setTimeout(() => {
          setShowUpdateToast(false);
        }, 5000);
      }
    } catch (error) {
      console.warn('載入持倉資料失敗或離線中:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [isAuthenticated, summary]);

  // 初次載入與定期更新 (45 秒一次，不重複打擊)
  useEffect(() => {
    if (isAuthenticated) {
      fetchPortfolio();
      const interval = setInterval(() => {
        fetchPortfolio(false);
      }, 45000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, fetchPortfolio]);

  // 網路狀態監聽
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      fetchPortfolio(false);
    };
    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [fetchPortfolio]);

  // PWA Service Worker 註冊與更新偵測
  useEffect(() => {
    if ('serviceWorker' in navigator && import.meta.env.MODE !== 'development') {
      navigator.serviceWorker.register('/sw.js').then((registration) => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setHasAppUpdate(true);
              }
            });
          }
        });
      }).catch((err) => {
        console.warn('Service Worker 註冊失敗:', err);
      });
    }
  }, []);

  const applyAppUpdate = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg && reg.waiting) {
          reg.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
        window.location.reload();
      });
    }
  };

  return (
    <PortfolioContext.Provider
      value={{
        summary,
        holdings,
        isLoading,
        isRefreshing,
        isOffline,
        lastUpdated,
        showUpdateToast,
        hasAppUpdate,
        refreshPortfolio: (manual = true) => fetchPortfolio(manual),
        applyAppUpdate,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = (): PortfolioContextType => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio 必須在 PortfolioProvider 內使用');
  }
  return context;
};
