# Serendipity Engine

「探していなかったものを見つける」体験を設計するナレッジプラットフォーム。

Rails 8 API + React 18で構築し、pgvectorによるセマンティック検索とAIによる発見機能を提供します。

## コンセプト

従来の検索が「既知の問いに対する答え」を提供するのに対し、Serendipity Engineは「まだ発見されていない問い」を浮かび上がらせます。

### コアバリュー

1. **偶発的発見（Serendipity）**: AIが意外なつながりを発見して提示
2. **忘却への抵抗**: 長期間アクセスされていない価値ある知識を再浮上
3. **クロスドメインブリッジ**: 異なるプロジェクト間の隠れた関連性を可視化
4. **学習経路最適化**: 知識の蓄積パターンから最適な学習ルートを提案

### ターゲットユーザー

- 大量のメモやノートを蓄積している知識労働者
- 複数プロジェクトを並行して進める開発者・研究者
- Second Brainを実践しているObsidian/Notionユーザー

## 実装済み機能

- ✅ ユーザー認証（Devise + JWT）
- ✅ ノートCRUD（作成・読み取り・更新・削除）
- ✅ プロジェクト管理
- ✅ タグ機能
- ✅ セマンティック検索（OpenAI Embeddings + pgvector）
- ✅ ノート間関連性可視化（React Flow グラフビュー）
- ✅ AI発見機能（Forgotten Gems, Bridge, Learning Path）
- ✅ モダンなUI/UX（Tailwind CSS）
- ✅ リアルタイム検索（Cmd+K）
- ✅ バックグラウンドジョブ（Solid Queue）
- ✅ Docker マルチステージビルド

## 技術スタック

### Backend

- Ruby 3.3.6
- Rails 8.1.1 (API mode)
- PostgreSQL 16 + pgvector
- Redis 7
- Solid Queue (Background Jobs)
- Devise + Devise-JWT (Authentication)
- OpenAI API (Embeddings)
- Neighbor gem (Vector Search)

### Frontend

- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router DOM
- TanStack Query (React Query)
- Zustand (State Management)
- Axios
- React Flow (Graph Visualization)

### Testing

- RSpec (Backend)
- FactoryBot + Faker
- VCR + Webmock
- Vitest + Testing Library (Frontend)
- Playwright (E2E)

## セットアップ

### 前提条件

- Docker Desktop
- OpenAI API キー（セマンティック検索用）

### 環境変数設定

`compose.yml` の以下の環境変数を設定してください：

```yaml
environment:
  OPENAI_API_KEY: ${OPENAI_API_KEY:-your-api-key-here}
  JWT_SECRET_KEY: ${JWT_SECRET_KEY:-your-secret-key}
```

または、`.env` ファイルを作成：

```bash
OPENAI_API_KEY=sk-your-openai-api-key
JWT_SECRET_KEY=your-jwt-secret-key
```

### 起動

```bash
# すべてのサービスをビルド・起動
docker compose up -d --build

# データベースのセットアップ
docker compose exec backend bundle exec rails db:create db:migrate

# サンプルデータ作成（オプション）
docker compose exec backend bundle exec rails db:seed
```

アプリケーションにアクセス：

- Frontend: <http://localhost:5173>
- Backend API: <http://localhost:3000>

### デフォルトユーザー

```text
Email: demo@example.com
Password: password123
```

## 開発

### Backend開発

```bash
# テスト実行
docker compose exec backend bundle exec rspec

# Lint
docker compose exec backend bundle exec rubocop

# コンソール
docker compose exec backend bundle exec rails console

# マイグレーション
docker compose exec backend bundle exec rails db:migrate
```

### Frontend開発

```bash
# テスト実行
docker compose run --rm frontend npm test

# Lint
docker compose run --rm frontend npm run lint

# E2Eテスト
docker compose run --rm frontend npx playwright test

# ビルド
docker compose run --rm frontend npm run build
```

## アーキテクチャ

### システム構成

```text
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                              │
│  React 18 + Vite + TypeScript + Tailwind CSS                │
│  (GraphView, NoteEditor, DiscoveryFeed, SearchModal)        │
└─────────────────────────────────────────────────────────────┘
                            │
                    REST API (JSON)
                            │
┌─────────────────────────────────────────────────────────────┐
│                    API LAYER                                 │
│  Rails 8 API-only + Devise-JWT                              │
│  (NotesController, DiscoveriesController, GraphController)  │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                    SERVICE LAYER                             │
│  EmbeddingService, DiscoveryEngine, ConnectionAnalyzer      │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                    BACKGROUND JOB LAYER                      │
│  Solid Queue (EmbeddingJob, ConnectionBuildJob, etc.)       │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                    DATA LAYER                                │
│  PostgreSQL 16 + pgvector + Redis 7                         │
└─────────────────────────────────────────────────────────────┘
```

### データフロー

```text
User Input → React Components → TanStack Query → Axios → Rails API
                                                            ↓
                                                    Service Objects
                                                            ↓
                                                    Background Jobs
                                                            ↓
                                                PostgreSQL + pgvector
```

### AI機能の仕組み

#### 1. Embedding生成

ノート作成・更新時に自動的にOpenAI APIでEmbeddingを生成します。

- ChunkingService: 長文を1000文字ずつのチャンクに分割
- EmbeddingService: 各チャンクのEmbeddingを生成（text-embedding-3-small）
- バックグラウンドジョブで非同期処理

#### 2. セマンティック検索

pgvectorのコサイン類似度検索で関連ノートを発見します。

- HNSWインデックスによる高速な近似最近傍検索
- ユーザーごとに検索範囲を制限
- 類似度スコアによるランキング

#### 3. Connection分析

複数の観点から関連性を分析します。

- **Semantic**: Embedding類似度による意味的関連
- **Explicit**: ユーザーが明示的に作成したリンク
- **Temporal**: 時間的近接性（同時期に作成・更新）
- **Tag-based**: 共通タグによる関連

#### 4. Discovery生成

毎日自動実行され、3種類の発見を提供します。

- **Forgotten Gems**: 30日以上アクセスされていない価値あるノート
- **Bridge**: 異なるプロジェクト間の意外な関連性
- **Daily**: 最近のノートとの予想外のつながり

## ディレクトリ構造

```text
serendipity-engine/
├── backend/                     # Rails 8 API
│   ├── app/
│   │   ├── controllers/api/v1/  # API Controllers
│   │   ├── jobs/                # Background Jobs
│   │   ├── models/              # ActiveRecord Models
│   │   └── services/            # Service Objects
│   ├── config/
│   │   └── recurring.yml        # Solid Queue設定
│   ├── db/migrate/              # マイグレーション
│   ├── spec/                    # RSpec テスト
│   └── Dockerfile               # マルチステージビルド
├── frontend/                    # React 18 + Vite
│   ├── src/
│   │   ├── api/                 # API Clients
│   │   ├── components/          # React Components
│   │   ├── pages/               # Page Components
│   │   ├── stores/              # Zustand Stores
│   │   └── types/               # TypeScript Types
│   ├── e2e/                     # Playwright E2E テスト
│   ├── nginx.conf               # 本番環境用Nginx設定
│   └── Dockerfile               # マルチステージビルド
├── docs/                        # ドキュメント
│   ├── specifications/          # 機能仕様書
│   ├── architecture/            # アーキテクチャドキュメント
│   └── api/                     # API仕様
├── compose.yml                  # 開発環境用Docker Compose
├── compose.prod.yml             # 本番環境用Docker Compose
└── env.production.example       # 本番環境変数テンプレート
```

## データベース設計

### 主要テーブル

- **users**: ユーザー情報（Devise）
- **projects**: プロジェクト管理
- **notes**: ノート本体
- **chunks**: ノートの分割チャンク（Embedding保存）
- **connections**: ノート間の関連性
- **tags**: タグ
- **note_tags**: ノートとタグの中間テーブル
- **discoveries**: AI発見結果
- **access_logs**: アクセス履歴

### pgvector設定

```ruby
# chunks テーブル
t.vector :embedding, limit: 1536  # OpenAI text-embedding-3-small

# HNSWインデックス（高速な近似最近傍検索）
add_index :chunks, :embedding, 
          using: :hnsw, 
          opclass: :vector_cosine_ops
```

## 開発原則

### TDD (Test-Driven Development)

すべての機能はテストから書き始めます。

```text
Red → Green → Refactor
```

- テストには固定値やハードコーディングを使用しない
- FactoryBotとFakerで動的なテストデータを生成
- テストが全てパスするまで実装を続ける

### テストの書き方

#### Backend (RSpec)

```ruby
# FactoryBot + Fakerを使用
it 'creates a note' do
  note_params = attributes_for(:note)
  
  expect {
    post '/api/v1/notes', params: { note: note_params }, headers: auth_headers
  }.to change(Note, :count).by(1)
  
  expect(response).to have_http_status(:created)
end
```

#### Frontend (Vitest)

```typescript
// ファクトリ関数を使用
test('displays note title', () => {
  const note = createMockNote();
  render(<NoteCard note={note} />);
  expect(screen.getByText(note.title)).toBeInTheDocument();
});
```

### テスト実行

#### Backend

```bash
# 全テスト実行
docker compose exec backend bundle exec rspec

# 特定ファイルのテスト
docker compose exec backend bundle exec rspec spec/models/note_spec.rb

# カバレッジ付きテスト
docker compose exec backend COVERAGE=true bundle exec rspec
```

#### Frontend

```bash
# Unit/Integration テスト
docker compose run --rm frontend npm test

# E2Eテスト
docker compose run --rm frontend npx playwright test

# E2Eテスト（UIモード）
docker compose run --rm frontend npx playwright test --ui
```

## Docker マルチステージビルド

このプロジェクトは、開発環境と本番環境の両方に対応したマルチステージビルドを採用しています。

### 開発環境（デフォルト）

```bash
# 開発環境用にビルド・起動
docker compose up -d --build
```

開発環境では、ホットリロード対応でコードの変更が即座に反映されます。

### 本番環境

```bash
# 本番環境用の環境変数を設定
cp env.production.example .env.production

# .env.productionを編集して必要な値を設定
# - POSTGRES_PASSWORD
# - SECRET_KEY_BASE
# - JWT_SECRET_KEY
# - OPENAI_API_KEY

# 本番環境用にビルド・起動
docker compose -f compose.prod.yml --env-file .env.production up -d --build

# データベースのセットアップ
docker compose -f compose.prod.yml exec backend bundle exec rails db:create db:migrate
```

本番環境の特徴です。

- **Backend**: 最小限のランタイム依存関係のみを含む最適化されたイメージ
- **Frontend**: Nginxで静的ファイルを配信し、APIリクエストをバックエンドにプロキシ
- **セキュリティ**: 非rootユーザーで実行、セキュリティヘッダーの設定
- **パフォーマンス**: Gzip圧縮、キャッシュ設定、ヘルスチェック

### マルチステージビルドの構成

#### Backend Dockerfile

1. **deps**: 依存関係のインストール
2. **production**: 本番環境用の最小イメージ
3. **development**: 開発環境用のフル機能イメージ

#### Frontend Dockerfile

1. **deps**: 本番用依存関係のインストール
2. **builder**: アプリケーションのビルド
3. **production**: Nginxで静的ファイルを配信
4. **development**: Vite開発サーバー

## デプロイ

### 本番環境設定

1. 環境変数を設定（`env.production.example`を参考に`.env.production`を作成）
2. 本番環境用Dockerイメージをビルド
3. データベースマイグレーション実行
4. Solid Queueワーカー起動

```bash
# 本番環境用にビルド・起動
docker compose -f compose.prod.yml --env-file .env.production up -d --build

# データベースのセットアップ
docker compose -f compose.prod.yml exec backend bundle exec rails db:create db:migrate

# Solid Queueワーカー起動（別コンテナで実行する場合）
docker compose -f compose.prod.yml exec backend bundle exec rake solid_queue:start
```

### 本番環境の環境変数

必須の環境変数です。

- `POSTGRES_PASSWORD`: PostgreSQLのパスワード
- `SECRET_KEY_BASE`: Railsのシークレットキー（`rails secret`で生成）
- `JWT_SECRET_KEY`: JWT認証のシークレットキー
- `OPENAI_API_KEY`: OpenAI APIキー

## 参考ドキュメント

詳細な情報は以下のドキュメントを参照してください。

- [機能仕様書](./docs/specifications/)
- [アーキテクチャドキュメント](./docs/architecture/)
- [API仕様](./docs/api/)
- [Docker マルチステージビルド](./docs/architecture/docker_multistage_build.md)

## ライセンス

MIT

## 貢献

プルリクエストを歓迎します。大きな変更の場合は、まずissueを開いて変更内容を議論してください。

## サポート

問題が発生した場合は、GitHubのissueを作成してください。
