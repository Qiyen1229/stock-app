import React, { useState } from 'react';
import { TrendingUp, Lock, User as UserIcon, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const AuthPage: React.FC = () => {
  const { login, register, isLoading } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username.trim() || !password) {
      setErrorMsg('請輸入使用者帳號與密碼');
      return;
    }

    try {
      if (isRegisterMode) {
        await register(username.trim(), password);
      } else {
        await login(username.trim(), password);
      }
    } catch (err: any) {
      setErrorMsg(err.message || '認證失敗，請檢查帳號與密碼');
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card glass-card">
        {/* 頂部 Logo 與標題 */}
        <div className="auth-brand-head">
          <div className="auth-icon-circle">
            <TrendingUp size={28} />
          </div>
          <h1 className="auth-title">我的股票</h1>
          <p className="auth-subtitle">個人台股與 ETF 即時資產管理系統</p>
        </div>

        {errorMsg && (
          <div className="auth-error-box">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 登入 / 註冊切換 Tab */}
        <div className="auth-mode-toggle">
          <button
            type="button"
            className={`toggle-tab ${!isRegisterMode ? 'active' : ''}`}
            onClick={() => { setIsRegisterMode(false); setErrorMsg(''); }}
          >
            帳號登入
          </button>
          <button
            type="button"
            className={`toggle-tab ${isRegisterMode ? 'active' : ''}`}
            onClick={() => { setIsRegisterMode(true); setErrorMsg(''); }}
          >
            新使用者註冊
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label className="field-lbl">使用者帳號</label>
            <div className="input-wrap">
              <UserIcon size={18} className="field-icon" />
              <input
                type="text"
                placeholder="請輸入帳號"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoCapitalize="none"
                autoCorrect="off"
                required
              />
            </div>
          </div>

          <div className="auth-field">
            <label className="field-lbl">密碼</label>
            <div className="input-wrap">
              <Lock size={18} className="field-icon" />
              <input
                type="password"
                placeholder="請輸入密碼"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="touch-btn touch-btn-primary auth-submit-btn"
          >
            {isLoading ? '驗證中...' : isRegisterMode ? '立即註冊並登入' : '登入系統'}
          </button>
        </form>

        <div className="auth-footer-prompt">
          <ShieldCheck size={14} className="shield-icon" />
          <span>私有 SQLite 資料庫加密保護，重啟或更新不遺失數據</span>
        </div>
      </div>

      <style>{`
        .auth-page-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: var(--bg-app);
        }

        .auth-card {
          width: 100%;
          max-width: 420px;
          padding: 32px 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .auth-brand-head {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .auth-icon-circle {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #FFFFFF;
          margin-bottom: 12px;
          box-shadow: 0 8px 24px var(--brand-glow);
        }

        .auth-title {
          font-size: 24px;
          font-weight: 800;
          color: var(--text-main);
          letter-spacing: -0.4px;
          margin-bottom: 4px;
        }

        .auth-subtitle {
          font-size: 13px;
          color: var(--text-secondary);
        }

        .auth-error-box {
          background: var(--tw-up-bg);
          color: var(--tw-up);
          padding: 10px 14px;
          border-radius: var(--radius-md);
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .auth-mode-toggle {
          display: flex;
          background: var(--bg-surface-elevated);
          padding: 4px;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-subtle);
        }

        .toggle-tab {
          flex: 1;
          border: none;
          background: none;
          padding: 8px 0;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .toggle-tab.active {
          background: var(--bg-surface);
          color: var(--brand-primary);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
          font-weight: 700;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .auth-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .field-lbl {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .field-icon {
          position: absolute;
          left: 14px;
          color: var(--text-muted);
          pointer-events: none;
        }

        .input-wrap input {
          padding-left: 42px;
        }

        .auth-submit-btn {
          height: 48px;
          font-size: 16px;
          margin-top: 6px;
        }

        .auth-footer-prompt {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 11px;
          color: var(--text-muted);
          text-align: center;
        }

        .shield-icon {
          color: #10B981;
        }
      `}</style>
    </div>
  );
};
