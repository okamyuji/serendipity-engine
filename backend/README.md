# Serendipity Engine - Backend

Rails 8 API + PostgreSQL + pgvector で構築されたバックエンドアプリケーション。

## 技術スタック

- **Rails 8.1.1**: API フレームワーク（API-only mode）
- **Ruby 3.3.6**: プログラミング言語
- **PostgreSQL 16**: データベース
- **pgvector**: ベクトル検索拡張
- **Devise + Devise-JWT**: 認証システム
- **Solid Queue**: バックグラウンドジョブ
- **Redis 7**: キャッシュ・セッション管理
- **OpenAI API**: Embedding 生成
- **Neighbor gem**: ベクトル検索（ActiveRecord 統合）
- **RSpec**: テストフレームワーク
- **FactoryBot + Faker**: テストデータ生成
- **VCR + Webmock**: API モック

## ディレクトリ構造

```text
app/
├── controllers/api/v1/  # API コントローラ
├── jobs/                # バックグラウンドジョブ
├── models/              # ActiveRecord モデル
└── services/            # サービスオブジェクト
config/
├── routes.rb            # ルーティング
└── recurring.yml        # Solid Queue 設定
db/
├── migrate/             # マイグレーション
└── seeds.rb             # シードデータ
spec/                    # RSpec テスト
```

## 開発

### ローカル開発

```bash
bundle install
bin/rails db:create db:migrate
bin/rails server
```

### テスト

```bash
# テスト実行
bundle exec rspec

# 特定ファイルのテスト
bundle exec rspec spec/models/note_spec.rb

# カバレッジ
COVERAGE=true bundle exec rspec
```

### Lint

```bash
bundle exec rubocop
```

### コンソール

```bash
bin/rails console
```

### マイグレーション

```bash
# マイグレーション実行
bin/rails db:migrate

# ロールバック
bin/rails db:rollback

# マイグレーション状態確認
bin/rails db:migrate:status
```

## Docker

```bash
# ビルド
docker compose build backend

# 起動
docker compose up backend

# 停止
docker compose down

# マイグレーション
docker compose exec backend bundle exec rails db:migrate

# コンソール
docker compose exec backend bundle exec rails console
```

## 環境変数

`.env.development` ファイルを作成します。

```bash
DATABASE_URL=postgres://serendipity:serendipity_dev@db:5432/serendipity_development
REDIS_URL=redis://redis:6379/0
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_MODEL=text-embedding-3-small
JWT_SECRET_KEY=your-secret-key-for-development
```

## データベース

### pgvector セットアップ

```sql
-- PostgreSQL で pgvector 拡張を有効化
CREATE EXTENSION vector;
```

### 主要テーブル

- `users`: ユーザー情報
- `projects`: プロジェクト管理
- `notes`: ノート本体
- `chunks`: ノートの分割チャンク（Embedding 保存）
- `connections`: ノート間の関連性
- `tags`: タグ
- `note_tags`: ノートとタグの中間テーブル
- `discoveries`: AI 発見結果
- `access_logs`: アクセス履歴

## 実装済み機能

- ✅ ユーザー認証（Devise + JWT）
- ✅ ノート CRUD API
- ✅ プロジェクト管理 API
- ✅ タグ管理 API
- ✅ Embedding 生成（OpenAI API）
- ✅ セマンティック検索（pgvector）
- ✅ Connection 分析
- ✅ Discovery 生成（AI 発見機能）
- ✅ グラフデータ API
- ✅ バックグラウンドジョブ（Solid Queue）
- ✅ テスト環境（RSpec + FactoryBot）
- ✅ Docker 対応

## API エンドポイント

### 認証

- `POST /api/v1/auth/signup` - ユーザー登録
- `POST /api/v1/auth/login` - ログイン
- `DELETE /api/v1/auth/logout` - ログアウト

### ノート

- `GET /api/v1/notes` - ノート一覧
- `GET /api/v1/notes/:id` - ノート詳細
- `POST /api/v1/notes` - ノート作成
- `PUT /api/v1/notes/:id` - ノート更新
- `DELETE /api/v1/notes/:id` - ノート削除
- `GET /api/v1/notes/:id/connections` - ノートの関連性

### プロジェクト

- `GET /api/v1/projects` - プロジェクト一覧
- `POST /api/v1/projects` - プロジェクト作成
- `PUT /api/v1/projects/:id` - プロジェクト更新
- `DELETE /api/v1/projects/:id` - プロジェクト削除

### タグ

- `GET /api/v1/tags` - タグ一覧
- `POST /api/v1/tags` - タグ作成
- `DELETE /api/v1/tags/:id` - タグ削除

### 検索

- `GET /api/v1/search/semantic?q=query` - セマンティック検索

### 発見

- `GET /api/v1/discoveries` - 発見一覧
- `POST /api/v1/discoveries/generate` - 発見生成
- `PUT /api/v1/discoveries/:id/act` - 発見を確認
- `PUT /api/v1/discoveries/:id/dismiss` - 発見を却下

### グラフ

- `GET /api/v1/graph` - グラフデータ取得

## バックグラウンドジョブ

### Solid Queue

- `EmbeddingJob`: ノートの Embedding 生成
- `ConnectionBuildJob`: ノート間の関連性分析
- `DailyDiscoveryJob`: 日次発見生成（毎日 6:00 AM）

### ジョブ管理

```bash
# ワーカー起動
bundle exec rake solid_queue:start

# ジョブ状態確認
bin/rails solid_queue:status
```

## トラブルシューティング

### pgvector が見つからない

```bash
# PostgreSQL で拡張を有効化
docker compose exec db psql -U serendipity -d serendipity_development -c "CREATE EXTENSION vector;"
```

### Redis 接続エラー

```bash
# Redis が起動しているか確認
docker compose ps redis

# Redis を再起動
docker compose restart redis
```

### OpenAI API エラー

環境変数 `OPENAI_API_KEY` が正しく設定されているか確認してください。
