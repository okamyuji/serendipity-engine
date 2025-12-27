# 認証システム仕様書

## 概要

Serendipity Engine の認証システムは、JWT (JSON Web Token) ベースのステートレス認証を採用する。
Devise を基盤とし、devise-jwt gem でトークン管理を行う。

## 機能要件

### FR-AUTH-001: ユーザー登録

**説明**: 新規ユーザーがメールアドレスとパスワードでアカウントを作成できる

**入力**:

- email: 有効なメールアドレス形式（必須、一意）
- password: 8文字以上（必須）
- password_confirmation: パスワード確認（必須、passwordと一致）
- name: 表示名（任意、最大100文字）

**出力**:

- 成功時: HTTP 201、ユーザー情報 + JWT トークン（Authorizationヘッダー）
- 失敗時: HTTP 422、エラーメッセージ配列

**検証ルール**:

- メールアドレスは RFC 5322 形式に準拠
- メールアドレスは大文字小文字を区別しない（正規化して保存）
- パスワードは最低8文字
- 同一メールアドレスでの重複登録は不可

### FR-AUTH-002: ログイン

**説明**: 登録済みユーザーがメールアドレスとパスワードで認証できる

**入力**:

- email: 登録済みメールアドレス（必須）
- password: パスワード（必須）

**出力**:

- 成功時: HTTP 200、ユーザー情報 + JWT トークン（Authorizationヘッダー）
- 失敗時: HTTP 401、エラーメッセージ

### FR-AUTH-003: ログアウト

**説明**: 認証済みユーザーがセッションを終了できる

**入力**:

- Authorization ヘッダー: Bearer トークン（必須）

**出力**:

- 成功時: HTTP 200
- 失敗時: HTTP 401（無効なトークン）

### FR-AUTH-004: 現在のユーザー情報取得

**説明**: 認証済みユーザーが自身の情報を取得できる

**入力**:

- Authorization ヘッダー: Bearer トークン（必須）

**出力**:

- 成功時: HTTP 200、ユーザー情報
- 失敗時: HTTP 401（未認証）

## データモデル

### users テーブル

| カラム | 型 | 制約 | 説明 |
| ------ | ---- | ---- | ----- |
| id | bigint | PK | 主キー |
| email | string | NOT NULL, UNIQUE | メールアドレス |
| encrypted_password | string | NOT NULL | ハッシュ化パスワード |
| name | string | | 表示名 |
| sign_in_count | integer | DEFAULT 0 | ログイン回数 |
| current_sign_in_at | datetime | | 現在のログイン日時 |
| last_sign_in_at | datetime | | 前回のログイン日時 |
| created_at | datetime | NOT NULL | 作成日時 |
| updated_at | datetime | NOT NULL | 更新日時 |

### jwt_denylist テーブル

| カラム | 型 | 制約 | 説明 |
| ------ | ---- | ---- | ---- |
| id | bigint | PK | 主キー |
| jti | string | NOT NULL, UNIQUE | JWT ID |
| exp | datetime | NOT NULL | 有効期限 |

## API エンドポイント

- POST /api/v1/auth/signup - ユーザー登録
- POST /api/v1/auth/login - ログイン  
- DELETE /api/v1/auth/logout - ログアウト
- GET /api/v1/auth/me - 現在のユーザー情報
