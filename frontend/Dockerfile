# ============================================
# Stage 1: 依存関係のインストール
# ============================================
FROM node:22-alpine AS deps

WORKDIR /app

# corepackはpackageManagerの版のpnpmを使う
RUN corepack enable

# 7日ルール(pnpm-workspace.yaml)をイメージ内でも効かせるため、一緒にコピーする
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# 依存関係をインストール（本番用）
RUN pnpm install --frozen-lockfile --prod

# ============================================
# Stage 2: ビルド
# ============================================
FROM node:22-alpine AS builder

WORKDIR /app

RUN corepack enable

# 依存関係をコピー（開発用も含む）
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# アプリケーションコードをコピー
COPY . .

# 本番用ビルド
RUN pnpm run build

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
FROM node:22-alpine AS development

WORKDIR /app

RUN corepack enable

# 依存関係をインストール
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# アプリケーションコードをコピー
COPY . .

# 開発サーバーを起動
EXPOSE 5173
CMD ["pnpm", "run", "dev", "--host", "0.0.0.0"]
