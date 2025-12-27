# ============================================
# Stage 1: 依存関係のインストール
# ============================================
FROM node:20-alpine AS deps

WORKDIR /app

# package.jsonとpackage-lock.jsonをコピー
COPY package*.json ./

# 依存関係をインストール（本番用）
RUN npm ci --omit=dev && \
    npm cache clean --force

# ============================================
# Stage 2: ビルド
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

# 依存関係をコピー（開発用も含む）
COPY package*.json ./
RUN npm ci

# アプリケーションコードをコピー
COPY . .

# 本番用ビルド
RUN npm run build

# ============================================
# Stage 3: 本番環境（Nginx）
# ============================================
FROM nginx:alpine AS production

# ビルド成果物をNginxの公開ディレクトリにコピー
COPY --from=builder /app/dist /usr/share/nginx/html

# カスタムNginx設定をコピー
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

# ============================================
# Stage 4: 開発環境
# ============================================
FROM node:20-alpine AS development

WORKDIR /app

# 依存関係をインストール
COPY package*.json ./
RUN npm ci

# アプリケーションコードをコピー
COPY . .

# 開発サーバーを起動
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
