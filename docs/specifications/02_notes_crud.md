# ノート CRUD 仕様書

## 概要

ナレッジベースの基本単位となるノートの作成・読取・更新・削除機能を提供する。

## 機能要件

### FR-NOTE-001: ノート作成

**説明**: 認証済みユーザーが新しいノートを作成できる

**入力**:

- title: ノートタイトル（必須、1-255文字）
- content: 本文（任意、最大100,000文字）
- project_id: 所属プロジェクトID（任意）
- tag_ids: タグID配列（任意）

**出力**:

- 成功時: HTTP 201、作成されたノート情報
- 失敗時: HTTP 422、バリデーションエラー

**動作**:

- 作成後、EmbeddingJob をキューに追加（content が存在する場合）

### FR-NOTE-002: ノート一覧取得

**説明**: 認証済みユーザーが自身のノート一覧を取得できる

**入力**:

- page: ページ番号（デフォルト: 1）
- per_page: 1ページあたりの件数（デフォルト: 20、最大: 100）
- project_id: プロジェクトでフィルタ（任意）
- tag_ids: タグでフィルタ（任意）
- q: キーワード検索（任意、タイトルと本文を対象）

**出力**:

- HTTP 200、ノート配列 + ページネーション情報

**並び順**: updated_at DESC（最新更新順）

### FR-NOTE-003: ノート詳細取得

**説明**: 認証済みユーザーが特定のノートを取得できる

**入力**:

- id: ノートID（必須）

**出力**:

- 成功時: HTTP 200、ノート詳細（関連データ含む）
- 失敗時: HTTP 404（存在しない or 他ユーザーのノート）

**動作**:

- アクセス時に last_accessed_at を更新
- access_count をインクリメント
- AccessLog を作成

### FR-NOTE-004: ノート更新

**説明**: 認証済みユーザーが自身のノートを更新できる

**入力**:

- id: ノートID（必須）
- title: 新しいタイトル（任意）
- content: 新しい本文（任意）
- project_id: 新しいプロジェクトID（任意）
- tag_ids: 新しいタグID配列（任意）
- pinned: ピン留め状態（任意）

**出力**:

- 成功時: HTTP 200、更新されたノート情報
- 失敗時: HTTP 404 / HTTP 422

**動作**:

- content が変更された場合、EmbeddingJob をキューに追加

### FR-NOTE-005: ノート削除

**説明**: 認証済みユーザーが自身のノートを削除できる

**入力**:

- id: ノートID（必須）

**出力**:

- 成功時: HTTP 204
- 失敗時: HTTP 404

**動作**:

- 関連する chunks, connections, access_logs も削除（CASCADE）

### FR-NOTE-006: ノートアーカイブ

**説明**: ノートを削除せずに非表示にできる

**入力**:

- id: ノートID（必須）

**出力**:

- 成功時: HTTP 200
- 失敗時: HTTP 404

## データモデル

### notes テーブル

| カラム | 型 | 制約 | 説明 |
| ------ | ---- | ---- | ---- |
| id | bigint | PK | 主キー |
| user_id | bigint | NOT NULL, FK | 所有ユーザー |
| project_id | bigint | FK | 所属プロジェクト |
| title | string | NOT NULL | タイトル |
| content | text | | 本文（Markdown） |
| content_html | text | | HTMLレンダリング済み本文 |
| last_accessed_at | datetime | | 最終アクセス日時 |
| access_count | integer | DEFAULT 0 | アクセス回数 |
| pinned | boolean | DEFAULT false | ピン留め |
| archived | boolean | DEFAULT false | アーカイブ済み |
| created_at | datetime | NOT NULL | 作成日時 |
| updated_at | datetime | NOT NULL | 更新日時 |

**インデックス**:

- user_id, created_at
- user_id, last_accessed_at
- user_id, access_count

## API エンドポイント

### GET /api/v1/notes

ノート一覧

### POST /api/v1/notes

ノート作成

### GET /api/v1/notes/:id

ノート詳細

### PATCH /api/v1/notes/:id

ノート更新

### DELETE /api/v1/notes/:id

ノート削除

### POST /api/v1/notes/:id/archive

ノートアーカイブ

### POST /api/v1/notes/:id/unarchive

ノートアーカイブ解除

## バリデーションルール

- title
  - 必須
  - 1文字以上255文字以下
  - 空白のみは不可
- content
  - 任意
  - 100,000文字以下
- project_id
  - 存在する場合、ユーザー所有のプロジェクトであること
