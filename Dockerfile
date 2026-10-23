# 第一階段：構建前端
FROM node:22-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
# 自動清理 macOS 上傳夾帶的 PaxHeader 與 ._* 檔案
RUN find . -name "PaxHeader" -exec rm -rf {} + 2>/dev/null || true
RUN find . -name "._*" -delete 2>/dev/null || true
RUN npm run build

# 第二階段：構建後端
FROM node:22-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend/ ./
# 自動清理 macOS 上傳夾帶的 PaxHeader 與 ._* 檔案
RUN find . -name "PaxHeader" -exec rm -rf {} + 2>/dev/null || true
RUN find . -name "._*" -delete 2>/dev/null || true
RUN npm run build

# 第三階段：正式運行環境 (輕量 Alpine，適合 Synology NAS)
FROM node:22-alpine AS runner
WORKDIR /app

# 安裝 SQLite 與 Node 基礎運行工具
RUN apk add --no-cache tzdata
ENV TZ=Asia/Taipei
ENV NODE_ENV=production
ENV PORT=8889
ENV DB_DIR=/app/database

# 複製後端依賴與編譯成果
COPY backend/package*.json ./backend/
RUN cd backend && npm install --omit=dev

COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# 建立持久化資料庫目錄
RUN mkdir -p /app/database

EXPOSE 8889

CMD ["node", "backend/dist/server.js"]
