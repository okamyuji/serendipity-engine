# 開発ガイド

## 概要

Serendipity Engine の開発環境のセットアップ方法と開発フローを説明します。

## 前提条件

開発を始める前に以下のツールをインストールしてください。

- Docker Desktop 4.0 以上
- Docker Compose 2.0 以上
- Git 2.30 以上
- テキストエディタ（VS Code 推奨）

## 環境構築

### リポジトリのクローン

以下のコマンドでリポジトリをクローンします。

```bash
git clone https://github.com/your-org/serendipity-engine.git
cd serendipity-engine
```

### 環境変数の設定

バックエンドの環境変数を設定します。

```bash
cd backend
cp .env.example .env
```

`.env` ファイルを編集して以下の値を設定します。

```env
OPENAI_API_KEY=your-openai-api-key
JWT_SECRET_KEY=your-secret-key
DATABASE_URL=postgres://postgres:password@db:5432/serendipity_development
REDIS_URL=redis://redis:6379/0
```

フロントエンドの環境変数を設定します。

```bash
cd ../frontend
cp .env.example .env
```

`.env` ファイルを編集して以下の値を設定します。

```env
VITE_API_URL=http://localhost:3000
```

### Docker コンテナの起動

以下のコマンドで全てのコンテナを起動します。

```bash
cd ..
docker-compose up -d
```

初回起動時はイメージのビルドに時間がかかります。

### データベースのセットアップ

以下のコマンドでデータベースを作成してマイグレーションを実行します。

```bash
docker-compose run --rm backend bin/rails db:create
docker-compose run --rm backend bin/rails db:migrate
docker-compose run --rm backend bin/rails db:seed
```

### 動作確認

以下の URL にアクセスして動作を確認します。

- バックエンド API: <http://localhost:3000>
- フロントエンド: <http://localhost:5173>

## 開発フロー

### ブランチ戦略

以下のブランチ戦略を採用します。

- main: 本番環境にデプロイされるブランチ
- develop: 開発中の機能を統合するブランチ
- feature/xxx: 新機能開発用のブランチ
- fix/xxx: バグ修正用のブランチ

新しい機能を開発する際は以下の手順で進めます。

1. develop ブランチから feature ブランチを作成します
2. 機能を実装します
3. テストを書いて実行します
4. プルリクエストを作成します
5. レビューを受けて修正します
6. develop ブランチにマージします

### コミットメッセージ

以下の形式でコミットメッセージを書きます。

```text
<type>: <subject>

<body>
```

type の種類は以下の通りです。

- feat: 新機能
- fix: バグ修正
- docs: ドキュメント
- style: コードスタイル
- refactor: リファクタリング
- test: テスト
- chore: その他

例は以下の通りです。

```text
feat: セマンティック検索機能を追加

OpenAI の Embedding API を使用して
ノートのセマンティック検索を実装しました
```

### テスト駆動開発

以下の手順でテスト駆動開発を実践します。

1. テストを書きます（Red）
2. テストが通る最小限の実装をします（Green）
3. コードをリファクタリングします（Refactor）

テストは以下のコマンドで実行します。

バックエンドのテストは以下の通りです。

```bash
docker-compose run --rm backend bundle exec rspec
```

フロントエンドのテストは以下の通りです。

```bash
cd frontend
npm test
```

### コードレビュー

プルリクエストを作成する際は以下を確認します。

- テストが全て通っている
- Lint エラーがない
- コードカバレッジが低下していない
- ドキュメントが更新されている

レビュアーは以下の観点でレビューします。

- コードの品質
- テストの充実度
- パフォーマンス
- セキュリティ
- 可読性

## バックエンド開発

### ディレクトリ構造

主要なディレクトリは以下の通りです。

```text
backend/
├── app/
│   ├── controllers/    # コントローラー
│   ├── models/         # モデル
│   ├── services/       # サービスオブジェクト
│   └── jobs/           # バックグラウンドジョブ
├── config/             # 設定ファイル
├── db/                 # データベース
│   ├── migrate/        # マイグレーション
│   └── seeds.rb        # シードデータ
└── spec/               # テスト
    ├── models/         # モデルテスト
    ├── requests/       # リクエストテスト
    ├── services/       # サービステスト
    └── jobs/           # ジョブテスト
```

### モデルの作成

以下のコマンドでモデルを作成します。

```bash
docker-compose run --rm backend bin/rails g model Note \
  title:string content:text user:references
docker-compose run --rm backend bin/rails db:migrate
```

モデルファイルにバリデーションとアソシエーションを追加します。

```ruby
class Note < ApplicationRecord
  belongs_to :user
  
  validates :title, presence: true, length: { maximum: 255 }
  validates :content, length: { maximum: 100_000 }
end
```

### コントローラーの作成

以下のコマンドでコントローラーを作成します。

```bash
docker-compose run --rm backend bin/rails g controller api/v1/Notes
```

CRUD アクションを実装します。

```ruby
module Api
  module V1
    class NotesController < BaseController
      def index
        @notes = current_user.notes
        render json: @notes
      end
      
      def create
        @note = current_user.notes.build(note_params)
        @note.save!
        render json: @note, status: :created
      end
      
      private
      
      def note_params
        params.require(:note).permit(:title, :content)
      end
    end
  end
end
```

### サービスオブジェクトの作成

ビジネスロジックをサービスオブジェクトに分離します。

```ruby
class EmbeddingService
  def initialize(api_key: ENV['OPENAI_API_KEY'])
    @client = OpenAI::Client.new(access_token: api_key)
  end
  
  def generate_embedding(text)
    response = @client.embeddings(
      parameters: {
        model: 'text-embedding-3-small',
        input: text
      }
    )
    
    response.dig('data', 0, 'embedding')
  end
end
```

### テストの作成

RSpec でテストを書きます。

```ruby
RSpec.describe Note, type: :model do
  describe 'validations' do
    it { should validate_presence_of(:title) }
    it { should validate_length_of(:title).is_at_most(255) }
  end
  
  describe 'associations' do
    it { should belong_to(:user) }
  end
end
```

### Lint の実行

以下のコマンドで Lint を実行します。

```bash
docker-compose run --rm backend bundle exec rubocop
```

自動修正する場合は以下のコマンドを実行します。

```bash
docker-compose run --rm backend bundle exec rubocop --autocorrect
```

## フロントエンド開発

### ディレクトリ構造

主要なディレクトリは以下の通りです。

```text
frontend/
├── src/
│   ├── api/            # API クライアント
│   ├── components/     # コンポーネント
│   ├── pages/          # ページコンポーネント
│   ├── stores/         # 状態管理
│   ├── types/          # TypeScript 型定義
│   └── utils/          # ユーティリティ
├── e2e/                # E2E テスト
└── __tests__/          # 単体テスト
```

### コンポーネントの作成

React コンポーネントを作成します。

```tsx
import { Note } from '../types'

interface NoteCardProps {
  note: Note
  onEdit: (note: Note) => void
  onDelete: (id: number) => void
}

export const NoteCard = ({ note, onEdit, onDelete }: NoteCardProps) => {
  return (
    <div className="card">
      <h3>{note.title}</h3>
      <p>{note.content}</p>
      <button onClick={() => onEdit(note)}>編集</button>
      <button onClick={() => onDelete(note.id)}>削除</button>
    </div>
  )
}
```

### API クライアントの作成

Axios を使用して API クライアントを作成します。

```typescript
import { apiClient } from './client'
import { Note } from '../types'

export const notesApi = {
  list: async (): Promise<Note[]> => {
    const response = await apiClient.get('/notes')
    return response.data
  },
  
  create: async (note: Partial<Note>): Promise<Note> => {
    const response = await apiClient.post('/notes', { note })
    return response.data
  }
}
```

### 状態管理

TanStack Query を使用してサーバー状態を管理します。

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notesApi } from '../api/notes'

export const useNotes = () => {
  return useQuery({
    queryKey: ['notes'],
    queryFn: notesApi.list
  })
}

export const useCreateNote = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: notesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['notes']
      })
    }
  })
}
```

### テストの作成

Vitest と Testing Library でテストを書きます。

```typescript
import { render, screen } from '@testing-library/react'
import { NoteCard } from './NoteCard'

describe('NoteCard', () => {
  it('ノートのタイトルと本文を表示する', () => {
    const note = {
      id: 1,
      title: 'テストノート',
      content: 'テスト本文'
    }
    
    render(<NoteCard note={note} onEdit={() => {}} onDelete={() => {}} />)
    
    expect(screen.getByText('テストノート')).toBeInTheDocument()
    expect(screen.getByText('テスト本文')).toBeInTheDocument()
  })
})
```

### Lint の実行

以下のコマンドで Lint を実行します。

```bash
cd frontend
npm run lint
```

自動修正する場合は以下のコマンドを実行します。

```bash
npm run lint:fix
```

## デバッグ

### バックエンドのデバッグ

以下のコマンドでログを確認します。

```bash
docker-compose logs -f backend
```

Rails コンソールを起動します。

```bash
docker-compose run --rm backend bin/rails console
```

デバッガーを使用する場合は `binding.pry` を挿入します。

### フロントエンドのデバッグ

ブラウザの開発者ツールを使用します。

- Console: ログの確認
- Network: API リクエストの確認
- React DevTools: コンポーネントの状態確認

## トラブルシューティング

### データベース接続エラー

以下のコマンドでデータベースコンテナを再起動します。

```bash
docker-compose restart db
```

### ポート競合エラー

他のプロセスがポートを使用している場合は以下のコマンドで確認します。

```bash
lsof -i :3000
lsof -i :5173
```

### Docker イメージのリビルド

以下のコマンドでイメージを再ビルドします。

```bash
docker-compose build --no-cache
docker-compose up -d
```

## パフォーマンス最適化

### N+1 クエリの防止

`includes` を使用して関連データを事前読み込みします。

```ruby
@notes = current_user.notes.includes(:project, :tags)
```

### キャッシュの活用

頻繁にアクセスされるデータをキャッシュします。

```ruby
Rails.cache.fetch("user_#{user.id}_notes", expires_in: 5.minutes) do
  user.notes.to_a
end
```

### フロントエンドの最適化

以下の最適化を実施します。

- コンポーネントのメモ化（React.memo）
- 状態の最小化
- 仮想化（react-window）
- コード分割（React.lazy）

## セキュリティ

### 環境変数の管理

機密情報は環境変数で管理します。

- `.env` ファイルは Git にコミットしません
- `.env.example` にサンプルを記載します
- 本番環境では暗号化された credentials を使用します

### 入力検証

全ての入力に対して検証を実施します。

- Strong Parameters の使用
- モデルバリデーション
- サニタイゼーション

### CORS の設定

適切な CORS 設定を行います。

```ruby
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins 'http://localhost:5173'
    resource '*',
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options]
  end
end
```
