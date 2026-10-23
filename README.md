# 我的股票 (Personal Taiwan Stock & ETF Asset Manager)

一套為台灣投資人量身打造的私有股票即時資產管理系統，支援完整 **iPhone 手機版介面**、**PWA 獨立 App**、**ETF 配息中心追蹤**、**多頻率定期定額複利計算器** 與 **Docker / Synology NAS 持久化部署**。

---

## 核心功能特色

### 一、iPhone 手機版與 PWA 支援
* **PWA 獨立應用程式**：支援 iOS Safari「分享 $\rightarrow$ 加入主畫面」，具備獨立 App 圖示（深邃藍金金融走勢圖）、全螢幕 Standalone 模式，不顯示瀏覽器網址列。
* **安全區域完整適配**：全面支援 `env(safe-area-inset-top)` 與 `env(safe-area-inset-bottom)`，完美避開 Dynamic Island、瀏海與 iPhone 底部 Home Indicator。
* **Mobile Bottom Navigation**：底部導航列（首頁、持倉、交易、配息、複利），點擊範圍大，桌面版自動隱藏。
* **手機版持倉卡片**：在手機端將表格轉換為資訊清晰的金融卡片，正損益紅色、負損益綠色（符合台灣股市習慣），點擊直接進入個股走勢詳情。
* **Mobile Bottom Sheet**：手機新增交易時由下方滑出表單，數字欄位自動呼叫 iPhone 數字/小數鍵盤（`inputMode="decimal"`）。
* **離線降級與自動同步**：在無網路時提示「目前離線，行情資料可能不是最新」，當網路恢復時自動重新獲取最新報價。
* **版本更新提示**：Service Worker 偵測到新版時提示「發現新版本，點擊重新載入」。

### 二、股票持倉與總資產 Dashboard
* **加權平均成本計算**：記錄每筆買進與賣出，自動計算總股數、成本均價、當前市值、未實現損益、損益率與今日損益。
* **投資成本欄位**：於總資產總覽、股票持倉、交易明細中清楚標示投資成本。
* **防止換行設計**：金額與單位（如 `NT$ 70,000` 與 `1,000 股`）保證整合為一列，絕不突兀分行。
* **一鍵整理功能**：頂部「一鍵整理」手動刷新行情，按鈕左側彈出限時 5 秒的「已更新資料」提示。
* **全台股上市標的與 ETF 支援**：內建台積電、鴻海、聯發科及各大高息 ETF（0056、00878、00919、00929 等）之代號與中文名稱即時搜尋。

### 三、ETF 配息追蹤中心
* **自動依持有標的匹配**：系統自動掃描使用者擁有的 ETF，主動呈現配息資訊，不需手動輸入。
* **清楚區分時程**：明確區分「除息日」與「預估發放日」。
* **現金流統計**：顯示每股配息、預估本次領息金額、年度總配息，並以圖表呈現 1~12 月每月配息分佈。

### 四、定期定額複利計算器
* **多投入頻率**：支援「每日」、「每週」、「每月」、「每年」投入週期。
* **精準複利公式**：正確處理 0% 報酬率除零邊界，提供 1/5/10/20/30 年快速切換。
* **暗色模式視覺優化**：幾何增長趨勢圖字體在高對比度下清晰可讀。
* **個人偏好儲存**：可將常用之本金、定期金額、報酬率一鍵儲存至資料庫。

### 五、多使用者與資料安全
* **完全隔離**：各使用者帳號擁有獨立的持倉、交易與配息設定。
* **資料庫持久化**：SQLite 數據持久保存於獨立 volume，容器重啟或更新後資料永不遺失。

---

## 技術架構

* **前端**：React 18 + TypeScript + Vite + Vanilla CSS System (CSS Variables) + Lucide Icons + PWA (Service Worker & Web Manifest)
* **後端**：Node.js + Express + TypeScript
* **資料庫**：SQLite (`better-sqlite3`，支援 WAL 高併發模式)
* **容器化**：多階段建置 Dockerfile、Docker Compose

---

## 本機開發與測試

### 1. 安裝前後端依賴
```bash
# 於專案根目錄執行
npm run install:all
```

### 2. 啟動後端開發伺服器
```bash
npm run dev:backend
# 後端運行於 http://localhost:8889
```

### 3. 啟動前端開發伺服器
```bash
npm run dev:frontend
# 前端運行於 http://localhost:8888
```

### 4. 建置驗證
```bash
npm run build
```

---

## Synology NAS / Docker 部署指南

### 1. 準備目錄與設定檔
在您的 Synology NAS（例如 `/volume1/docker/stock-app`）建立專案資料夾，並將程式碼複製至該處。

### 2. 一鍵啟動容器
```bash
docker compose up -d --build
```

### 3. 資料持久化保證
`docker-compose.yml` 已預設掛載 `./database:/app/database`：
```yaml
volumes:
  - ./database:/app/database
```
日後更新程式碼或重新拉取容器映像檔時，所有使用者資料庫檔案均穩妥儲存於實體硬碟中，絕不會遺失。

### 4. 存取網站
於瀏覽器開啟 `http://<您的NAS內網IP>:8889`（或透過 Tailscale / 反向代理存取）。

---

## iPhone Safari PWA 加入主畫面步驟

1. 在 iPhone Safari 中開啟本網站網址。
2. 點擊 Safari 底部工具列的 **分享按鈕**（向上箭頭）。
3. 向下滑動並選擇 **「加入主畫面」**（Add to Home Screen）。
4. 名稱確認為「我的股票」，點擊右上角「新增」。
5. 返回 iPhone 主畫面，點擊 App 圖示即可享受宛如原生 App 的全螢幕體驗！
