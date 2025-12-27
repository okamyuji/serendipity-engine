# API エンドポイント一覧

## 概要

Serendipity Engine の REST API エンドポイントの一覧です。全てのエンドポイントは `/api/v1` プレフィックスを持ちます。

## 認証

### POST /auth/signup

新規ユーザー登録を行います。

リクエストボディは以下の通りです。

```json
{
  "user": {
    "email": "user@example.com",
    "password": "password123",
    "password_confirmation": "password123",
    "name": "ユーザー名"
  }
}
```

レスポンス（成功時）は以下の通りです。

```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "ユーザー名",
    "created_at": "2024-01-01T00:00:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiJ9..."
}
```

ステータスコードは 201 Created です。

### POST /auth/login

ログインを行います。

リクエストボディは以下の通りです。

```json
{
  "user": {
    "email": "user@example.com",
    "password": "password123"
  }
}
```

レスポンス（成功時）は以下の通りです。

```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "ユーザー名"
  },
  "token": "eyJhbGciOiJIUzI1NiJ9..."
}
```

ステータスコードは 200 OK です。

### DELETE /auth/logout

ログアウトを行います。

リクエストヘッダーは以下の通りです。

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

レスポンス（成功時）は以下の通りです。

```json
{
  "message": "ログアウトしました"
}
```

ステータスコードは 200 OK です。

### GET /auth/me

現在のユーザー情報を取得します。

リクエストヘッダーは以下の通りです。

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

レスポンス（成功時）は以下の通りです。

```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "ユーザー名",
  "created_at": "2024-01-01T00:00:00Z"
}
```

ステータスコードは 200 OK です。

## ノート

### GET /notes

ノート一覧を取得します。

クエリパラメータは以下の通りです。

- project_id: プロジェクトIDでフィルタ（任意）
- tag_ids: タグIDでフィルタ（カンマ区切り、任意）
- archived: アーカイブ済みのみ取得（true/false、任意）
- pinned: ピン留めのみ取得（true/false、任意）

レスポンス（成功時）は以下の通りです。

```json
[
  {
    "id": 1,
    "title": "ノートタイトル",
    "content": "ノート本文",
    "project": {
      "id": 1,
      "name": "プロジェクト名",
      "color": "#6366f1"
    },
    "tags": [
      {
        "id": 1,
        "name": "タグ名",
        "color": "#ef4444"
      }
    ],
    "pinned": false,
    "archived": false,
    "access_count": 5,
    "last_accessed_at": "2024-01-08T10:00:00Z",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-08T10:00:00Z"
  }
]
```

ステータスコードは 200 OK です。

### GET /notes/:id

特定のノートを取得します。

レスポンス（成功時）は以下の通りです。

```json
{
  "id": 1,
  "title": "ノートタイトル",
  "content": "ノート本文",
  "project": {
    "id": 1,
    "name": "プロジェクト名",
    "color": "#6366f1"
  },
  "tags": [
    {
      "id": 1,
      "name": "タグ名",
      "color": "#ef4444"
    }
  ],
  "chunks": [
    {
      "id": 1,
      "content": "チャンク内容",
      "position": 0
    }
  ],
  "pinned": false,
  "archived": false,
  "access_count": 6,
  "last_accessed_at": "2024-01-08T10:05:00Z",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-08T10:00:00Z"
}
```

ステータスコードは 200 OK です。

### POST /notes

新しいノートを作成します。

リクエストボディは以下の通りです。

```json
{
  "note": {
    "title": "ノートタイトル",
    "content": "ノート本文",
    "project_id": 1,
    "tag_ids": [1, 2],
    "pinned": false
  }
}
```

レスポンス（成功時）は以下の通りです。

```json
{
  "id": 1,
  "title": "ノートタイトル",
  "content": "ノート本文",
  "project": {
    "id": 1,
    "name": "プロジェクト名",
    "color": "#6366f1"
  },
  "tags": [
    {
      "id": 1,
      "name": "タグ名",
      "color": "#ef4444"
    }
  ],
  "created_at": "2024-01-08T10:00:00Z",
  "updated_at": "2024-01-08T10:00:00Z"
}
```

ステータスコードは 201 Created です。

### PATCH /notes/:id

ノートを更新します。

リクエストボディは以下の通りです。

```json
{
  "note": {
    "title": "更新後のタイトル",
    "content": "更新後の本文",
    "project_id": 2,
    "tag_ids": [2, 3],
    "pinned": true
  }
}
```

レスポンス（成功時）は以下の通りです。

```json
{
  "id": 1,
  "title": "更新後のタイトル",
  "content": "更新後の本文",
  "project": {
    "id": 2,
    "name": "プロジェクト名",
    "color": "#6366f1"
  },
  "tags": [
    {
      "id": 2,
      "name": "タグ名",
      "color": "#ef4444"
    }
  ],
  "updated_at": "2024-01-08T11:00:00Z"
}
```

ステータスコードは 200 OK です。

### DELETE /notes/:id

ノートを削除します。

レスポンス（成功時）はボディなしです。

ステータスコードは 204 No Content です。

## プロジェクト

### GET /projects

プロジェクト一覧を取得します。

レスポンス（成功時）は以下の通りです。

```json
[
  {
    "id": 1,
    "name": "プロジェクト名",
    "description": "プロジェクトの説明",
    "color": "#6366f1",
    "archived": false,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

ステータスコードは 200 OK です。

### GET /projects/:id

特定のプロジェクトを取得します。

レスポンス（成功時）は以下の通りです。

```json
{
  "id": 1,
  "name": "プロジェクト名",
  "description": "プロジェクトの説明",
  "color": "#6366f1",
  "archived": false,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

ステータスコードは 200 OK です。

### POST /projects

新しいプロジェクトを作成します。

リクエストボディは以下の通りです。

```json
{
  "project": {
    "name": "プロジェクト名",
    "description": "プロジェクトの説明",
    "color": "#6366f1"
  }
}
```

レスポンス（成功時）は以下の通りです。

```json
{
  "id": 1,
  "name": "プロジェクト名",
  "description": "プロジェクトの説明",
  "color": "#6366f1",
  "archived": false,
  "created_at": "2024-01-08T10:00:00Z",
  "updated_at": "2024-01-08T10:00:00Z"
}
```

ステータスコードは 201 Created です。

### PATCH /projects/:id

プロジェクトを更新します。

リクエストボディは以下の通りです。

```json
{
  "project": {
    "name": "更新後の名前",
    "description": "更新後の説明",
    "color": "#ef4444",
    "archived": false
  }
}
```

レスポンス（成功時）は以下の通りです。

```json
{
  "id": 1,
  "name": "更新後の名前",
  "description": "更新後の説明",
  "color": "#ef4444",
  "archived": false,
  "updated_at": "2024-01-08T11:00:00Z"
}
```

ステータスコードは 200 OK です。

### DELETE /projects/:id

プロジェクトを削除します。

レスポンス（成功時）はボディなしです。

ステータスコードは 204 No Content です。

## タグ

### GET /tags

タグ一覧を取得します。

レスポンス（成功時）は以下の通りです。

```json
[
  {
    "id": 1,
    "name": "タグ名",
    "color": "#ef4444",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

ステータスコードは 200 OK です。

### GET /tags/:id

特定のタグを取得します。

レスポンス（成功時）は以下の通りです。

```json
{
  "id": 1,
  "name": "タグ名",
  "color": "#ef4444",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

ステータスコードは 200 OK です。

### POST /tags

新しいタグを作成します。

リクエストボディは以下の通りです。

```json
{
  "tag": {
    "name": "タグ名",
    "color": "#ef4444"
  }
}
```

レスポンス（成功時）は以下の通りです。

```json
{
  "id": 1,
  "name": "タグ名",
  "color": "#ef4444",
  "created_at": "2024-01-08T10:00:00Z",
  "updated_at": "2024-01-08T10:00:00Z"
}
```

ステータスコードは 201 Created です。

### PATCH /tags/:id

タグを更新します。

リクエストボディは以下の通りです。

```json
{
  "tag": {
    "name": "更新後の名前",
    "color": "#10b981"
  }
}
```

レスポンス（成功時）は以下の通りです。

```json
{
  "id": 1,
  "name": "更新後の名前",
  "color": "#10b981",
  "updated_at": "2024-01-08T11:00:00Z"
}
```

ステータスコードは 200 OK です。

### DELETE /tags/:id

タグを削除します。

レスポンス（成功時）はボディなしです。

ステータスコードは 204 No Content です。

## 検索

### GET /search

キーワード検索を実行します。

クエリパラメータは以下の通りです。

- q: 検索クエリ（必須）
- limit: 結果の最大件数（任意、デフォルト10）

レスポンス（成功時）は以下の通りです。

```json
{
  "results": [
    {
      "id": 1,
      "title": "ノートタイトル",
      "content": "ノート本文",
      "project": {
        "id": 1,
        "name": "プロジェクト名",
        "color": "#6366f1"
      },
      "tags": []
    }
  ],
  "query": "検索クエリ",
  "search_type": "keyword"
}
```

ステータスコードは 200 OK です。

### GET /search/semantic

セマンティック検索を実行します。

クエリパラメータは以下の通りです。

- q: 検索クエリ（必須）
- limit: 結果の最大件数（任意、デフォルト10）

レスポンス（成功時）は以下の通りです。

```json
{
  "results": [
    {
      "id": 1,
      "title": "ノートタイトル",
      "content": "ノート本文",
      "similarity_score": 0.85,
      "project": {
        "id": 1,
        "name": "プロジェクト名",
        "color": "#6366f1"
      },
      "tags": []
    }
  ],
  "query": "検索クエリ",
  "search_type": "semantic"
}
```

ステータスコードは 200 OK です。

## 発見

### GET /discoveries

発見の一覧を取得します。

レスポンス（成功時）は以下の通りです。

```json
[
  {
    "id": 1,
    "discovery_type": "bridge",
    "source_note": {
      "id": 1,
      "title": "ノートA"
    },
    "target_note": {
      "id": 2,
      "title": "ノートB"
    },
    "explanation": "「プロジェクトA」と「プロジェクトB」に予想外のつながりが見つかりました",
    "relevance_score": 0.85,
    "viewed": false,
    "acted_upon": false,
    "dismissed": false,
    "expires_at": "2024-01-15T00:00:00Z",
    "created_at": "2024-01-08T06:00:00Z"
  }
]
```

ステータスコードは 200 OK です。

### GET /discoveries/:id

特定の発見を取得します。

レスポンス（成功時）は以下の通りです。

```json
{
  "id": 1,
  "discovery_type": "bridge",
  "source_note": {
    "id": 1,
    "title": "ノートA",
    "content": "ノートAの本文"
  },
  "target_note": {
    "id": 2,
    "title": "ノートB",
    "content": "ノートBの本文"
  },
  "explanation": "「プロジェクトA」と「プロジェクトB」に予想外のつながりが見つかりました",
  "relevance_score": 0.85,
  "viewed": true,
  "acted_upon": false,
  "dismissed": false,
  "expires_at": "2024-01-15T00:00:00Z",
  "created_at": "2024-01-08T06:00:00Z"
}
```

ステータスコードは 200 OK です。

### POST /discoveries/:id/act

発見を承認してコネクションを確定します。

レスポンス（成功時）は以下の通りです。

```json
{
  "id": 1,
  "acted_upon": true
}
```

ステータスコードは 200 OK です。

### DELETE /discoveries/:id/dismiss

発見を却下します。

レスポンス（成功時）はボディなしです。

ステータスコードは 204 No Content です。

### POST /discoveries/generate

手動で発見を生成します。

レスポンス（成功時）は以下の通りです。

```json
[
  {
    "id": 1,
    "discovery_type": "bridge",
    "source_note": {
      "id": 1,
      "title": "ノートA"
    },
    "target_note": {
      "id": 2,
      "title": "ノートB"
    }
  }
]
```

ステータスコードは 200 OK です。

## グラフ

### GET /graph

グラフデータを取得します。

クエリパラメータは以下の通りです。

- limit: ノード数の上限（任意、デフォルト100）
- min_strength: エッジの最小強度（任意、デフォルト0.5）

レスポンス（成功時）は以下の通りです。

```json
{
  "nodes": [
    {
      "id": "1",
      "type": "note",
      "data": {
        "label": "ノートタイトル",
        "project": "プロジェクト名",
        "projectColor": "#6366f1",
        "tags": ["タグ1", "タグ2"],
        "accessCount": 10,
        "lastAccessed": "2024-01-08T10:00:00Z",
        "createdAt": "2024-01-01T00:00:00Z",
        "hasChunks": true
      }
    }
  ],
  "edges": [
    {
      "id": "e1-2",
      "source": "1",
      "target": "2",
      "type": "smoothstep",
      "data": {
        "strength": 0.85,
        "connectionType": "semantic",
        "aiSuggested": true,
        "confirmed": false
      }
    }
  ]
}
```

ステータスコードは 200 OK です。

## エラーレスポンス

### バリデーションエラー

ステータスコードは 422 Unprocessable Entity です。

```json
{
  "errors": [
    "タイトルを入力してください",
    "本文は100000文字以内で入力してください"
  ]
}
```

### 認証エラー

ステータスコードは 401 Unauthorized です。

```json
{
  "error": "認証に失敗しました"
}
```

### リソース不在エラー

ステータスコードは 404 Not Found です。

```json
{
  "error": "ノートが見つかりません"
}
```

### サーバーエラー

ステータスコードは 500 Internal Server Error です。

```json
{
  "error": "サーバーエラーが発生しました"
}
```
