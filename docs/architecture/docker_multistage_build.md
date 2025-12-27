# Docker マルチステージビルド

## 概要

Serendipity Engineは、開発環境と本番環境の両方に対応したマルチステージビルドを採用しています。これにより、開発時の利便性と本番環境のパフォーマンス・セキュリティを両立しています。

## イメージサイズの比較

マルチステージビルドにより、本番環境のイメージサイズを大幅に削減できます。

### Backend

- 開発環境: 1.85GB（フル機能、開発ツール含む）
- 本番環境: 767MB（ランタイム依存関係のみ）
- 削減率: 約58%

### Frontend

- 開発環境: 821MB（Vite開発サーバー、node_modules含む）
- 本番環境: 81.8MB（Nginx + 静的ファイルのみ）
- 削減率: 約90%

## Backend Dockerfile の構成

### Stage 1: deps（依存関係のインストール）

```dockerfile
FROM ruby:3.3.6-slim AS deps
```

このステージでは、本番環境に必要なGemのみをインストールします。

- `ruby:3.3.6-slim`を使用してベースイメージを最小化
- `bundle config set --local deployment 'true'`で本番モード
- `bundle config set --local without 'development test'`で開発・テスト用Gemを除外

### Stage 2: production（本番環境）

```dockerfile
FROM ruby:3.3.6-slim AS production
```

このステージでは、ランタイムに必要な最小限のパッケージのみをインストールします。

- ランタイム依存関係のみ（`libpq5`, `postgresql-client`）
- 非rootユーザー（`rails`）で実行
- ビルドツールを含まない

### Stage 3: development（開発環境）

```dockerfile
FROM ruby:3.3.6 AS development
```

このステージでは、開発に必要なすべてのツールをインストールします。

- フルサイズの`ruby:3.3.6`イメージ
- ビルドツール（`build-essential`）
- 開発・テスト用Gem
- ホットリロード対応

## Frontend Dockerfile の構成

### Stage 1: deps（依存関係のインストール）

```dockerfile
FROM node:20-alpine AS deps
```

このステージでは、本番環境に必要なnpmパッケージのみをインストールします。

- `npm ci --omit=dev`で本番用依存関係のみ
- `npm cache clean --force`でキャッシュを削除

### Stage 2: builder（ビルド）

```dockerfile
FROM node:20-alpine AS builder
```

このステージでは、アプリケーションをビルドします。

- すべての依存関係をインストール（開発用も含む）
- `npm run build`で本番用ビルドを実行
- `/app/dist`に静的ファイルを生成

### Stage 3: production（本番環境）

```dockerfile
FROM nginx:alpine AS production
```

このステージでは、Nginxで静的ファイルを配信します。

- `nginx:alpine`で最小限のWebサーバー
- ビルド成果物（`/app/dist`）のみをコピー
- カスタムNginx設定でSPAルーティングとAPIプロキシを設定
- Gzip圧縮、キャッシュ、セキュリティヘッダーを有効化

### Stage 4: development（開発環境）

```dockerfile
FROM node:20-alpine AS development
```

このステージでは、Vite開発サーバーを起動します。

- すべての依存関係をインストール
- ホットリロード対応
- ポート5173で開発サーバーを起動

## 使用方法

### 開発環境

```bash
# compose.ymlを使用（デフォルトでdevelopmentステージを使用）
docker compose up -d --build
```

`compose.yml`では、`target: development`を指定しています。

```yaml
backend:
  build:
    context: ./backend
    dockerfile: Dockerfile
    target: development

frontend:
  build:
    context: ./frontend
    dockerfile: Dockerfile
    target: development
```

### 本番環境

```bash
# compose.prod.ymlを使用（productionステージを使用）
docker compose -f compose.prod.yml --env-file .env.production up -d --build
```

`compose.prod.yml`では、`target: production`を指定しています。

```yaml
backend:
  build:
    context: ./backend
    dockerfile: Dockerfile
    target: production

frontend:
  build:
    context: ./frontend
    dockerfile: Dockerfile
    target: production
```

### 個別にビルド

```bash
# Backendの本番環境イメージをビルド
docker build --target production -t serendipity-backend-prod ./backend

# Frontendの本番環境イメージをビルド
docker build --target production -t serendipity-frontend-prod ./frontend

# Backendの開発環境イメージをビルド
docker build --target development -t serendipity-backend-dev ./backend

# Frontendの開発環境イメージをビルド
docker build --target development -t serendipity-frontend-dev ./frontend
```

## Nginx設定（Frontend本番環境）

`frontend/nginx.conf`では、以下の設定を行っています。

### SPAルーティング

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

すべてのルートをReact Routerで処理します。

### APIプロキシ

```nginx
location /api/ {
    proxy_pass http://backend:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

`/api/`へのリクエストをバックエンドにプロキシします。

### Gzip圧縮

```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
```

テキストベースのファイルを圧縮して転送量を削減します。

### キャッシュ設定

```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

静的アセットに長期キャッシュを設定します。

### セキュリティヘッダー

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
```

基本的なセキュリティヘッダーを追加します。

## セキュリティ上の利点

### 非rootユーザーでの実行（Backend）

本番環境では、`rails`ユーザーを作成し、非rootで実行します。

```dockerfile
RUN groupadd -r rails && useradd -r -g rails rails && \
    chown -R rails:rails /app

USER rails
```

これにより、コンテナが侵害された場合の影響を最小限に抑えます。

### 最小限のパッケージ

本番環境では、ランタイムに必要な最小限のパッケージのみをインストールします。これにより、攻撃対象領域を削減します。

### ビルドツールの除外

本番環境のイメージには、`build-essential`などのビルドツールを含めません。これにより、攻撃者がコンテナ内でコードをコンパイルすることを防ぎます。

## パフォーマンス上の利点

### イメージサイズの削減

マルチステージビルドにより、本番環境のイメージサイズを大幅に削減できます。これにより、以下のメリットがあります。

- デプロイ時間の短縮
- ストレージコストの削減
- ネットワーク転送量の削減

### レイヤーキャッシュの最適化

依存関係のインストールとアプリケーションコードのコピーを分離することで、コードの変更時に依存関係の再インストールを回避できます。

```dockerfile
# 依存関係を先にコピー
COPY Gemfile Gemfile.lock ./
RUN bundle install

# アプリケーションコードを後でコピー
COPY . .
```

### 並列ビルド

マルチステージビルドにより、複数のステージを並列でビルドできます。

## まとめ

マルチステージビルドを採用することで、以下のメリットを実現しています。

1. 開発環境と本番環境の明確な分離
2. 本番環境のイメージサイズを大幅に削減（Backend: 58%削減、Frontend: 90%削減）
3. セキュリティの向上（非rootユーザー、最小限のパッケージ）
4. パフォーマンスの向上（デプロイ時間の短縮、キャッシュの最適化）
5. 開発体験の維持（ホットリロード、フル機能の開発ツール）

この設計により、開発時の利便性を損なうことなく、本番環境のセキュリティとパフォーマンスを最大化しています。
