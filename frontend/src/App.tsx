import React, { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { Header } from './components/Header';
import { MobileBottomNav, NavTab } from './components/MobileBottomNav';
import { DashboardPage } from './pages/DashboardPage';
import { HoldingsPage } from './pages/HoldingsPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { DividendsPage } from './pages/DividendsPage';
import { CompoundPage } from './pages/CompoundPage';
import { StockDetailPage } from './pages/StockDetailPage';
import { AuthPage } from './pages/AuthPage';
import { TransactionModal } from './components/TransactionModal';

export const App: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [selectedStock, setSelectedStock] = useState<string | null>(null);

  // 交易 Modal 狀態
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [tradeInitialSymbol, setTradeInitialSymbol] = useState('');
  const [tradeInitialType, setTradeInitialType] = useState<'BUY' | 'SELL'>('BUY');
  const [editingTxId, setEditingTxId] = useState<number | undefined>(undefined);

  // 未登入直接顯示登入/註冊頁面
  if (!isAuthenticated) {
    return <AuthPage />;
  }

  const handleOpenNewTransaction = (symbol: string = '', type: 'BUY' | 'SELL' = 'BUY') => {
    setTradeInitialSymbol(symbol);
    setTradeInitialType(type);
    setEditingTxId(undefined);
    setIsTradeModalOpen(true);
  };

  const handleEditTransaction = (tx: any) => {
    setTradeInitialSymbol(tx.symbol);
    setTradeInitialType(tx.type);
    setEditingTxId(tx.id);
    setIsTradeModalOpen(true);
  };

  const handleSelectStock = (symbol: string) => {
    setSelectedStock(symbol);
  };

  const handleBackFromDetail = () => {
    setSelectedStock(null);
  };

  const handleTabChange = (tab: NavTab) => {
    setSelectedStock(null);
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app-container">
      {/* 頂部 Header */}
      <Header activeTab={activeTab} onTabChange={handleTabChange} />

      {/* 主內容區塊 */}
      <main className="main-content-flow">
        {selectedStock ? (
          <StockDetailPage
            symbol={selectedStock}
            onBack={handleBackFromDetail}
            onOpenTrade={(sym, type) => handleOpenNewTransaction(sym, type)}
          />
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <DashboardPage
                onOpenNewTransaction={() => handleOpenNewTransaction()}
                onSelectStock={handleSelectStock}
                onNavigateTab={handleTabChange}
              />
            )}

            {activeTab === 'holdings' && (
              <HoldingsPage
                onSelectStock={handleSelectStock}
                onOpenTrade={() => handleOpenNewTransaction()}
              />
            )}

            {activeTab === 'transactions' && (
              <TransactionsPage
                onOpenNewTransaction={() => handleOpenNewTransaction()}
                onEditTransaction={handleEditTransaction}
              />
            )}

            {activeTab === 'dividends' && (
              <DividendsPage
                onSelectStock={handleSelectStock}
                onOpenTrade={() => handleOpenNewTransaction('', 'BUY')}
              />
            )}

            {activeTab === 'compound' && <CompoundPage />}
          </>
        )}
      </main>

      {/* iPhone 手機專用底部 Navigation Bar (桌面版自動隱藏) */}
      <MobileBottomNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onOpenNewTransaction={() => handleOpenNewTransaction()}
      />

      {/* 交易新增/編輯 Bottom Sheet Modal */}
      <TransactionModal
        isOpen={isTradeModalOpen}
        onClose={() => setIsTradeModalOpen(false)}
        initialSymbol={tradeInitialSymbol}
        initialType={tradeInitialType}
        editingId={editingTxId}
      />

      <style>{`
        .main-content-flow {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
        }
      `}</style>
    </div>
  );
};
export default App;
