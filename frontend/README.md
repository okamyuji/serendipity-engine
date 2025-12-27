# Serendipity Engine - Frontend

React 18 + Vite + TypeScript で構築されたフロントエンドアプリケーション。

## 技術スタック

- **React 18**: UIライブラリ
- **Vite**: ビルドツール
- **TypeScript**: 型安全性
- **React Router**: ルーティング
- **TanStack Query**: データフェッチング
- **Zustand**: 状態管理
- **Axios**: HTTP クライアント
- **React Flow**: グラフビジュアライゼーション
- **Vitest**: テストフレームワーク
- **Testing Library**: コンポーネントテスト

## ディレクトリ構造

```text
src/
├── api/              # API クライアント
├── components/       # 再利用可能なコンポーネント
├── hooks/            # カスタムフック
├── pages/            # ページコンポーネント
├── stores/           # Zustand ストア
├── types/            # TypeScript 型定義
├── utils/            # ユーティリティ関数
└── test/             # テストユーティリティ
```

## 開発

### ローカル開発

```bash
npm install
npm run dev
```

### テスト

```bash
# テスト実行
npm test

# テストUI
npm run test:ui

# カバレッジ
npm run test:coverage
```

### Lint

```bash
npm run lint
```

### ビルド

```bash
npm run build
```

## Docker

```bash
# ビルド
docker compose build frontend

# 起動
docker compose up frontend

# 停止
docker compose down
```

## 環境変数

`.env.development` ファイルを作成:

```text
VITE_API_URL=http://localhost:3000
```

## 実装済み機能

- ✅ 認証システム（ログイン）
- ✅ ノート一覧表示
- ✅ 型安全なAPI クライアント
- ✅ 状態管理（Zustand）
- ✅ テスト環境（Vitest + Testing Library）
- ✅ Docker 対応

## 今後の実装予定

- ノート作成・編集・削除
- プロジェクト管理
- タグ管理
- セマンティック検索
- グラフビジュアライゼーション
- Discovery 機能
