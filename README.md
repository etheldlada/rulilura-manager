# RuLiLuRa Manager
**幻奏戦記 Ru/Li/Lu/Ra ノイシュタルト** キャラクター管理Webシステム

## 機能
- 英雄・歌姫・奏甲シートの作成・編集・閲覧
- 能力値から各種修正値・HP/MPを自動計算
- キャラクターの公開/非公開切り替え
- 共有URL（トークン付き）による個別共有
- **ccfolia用JSONエクスポート**（コマンド自動生成付き）
- ユーザー認証（JWT）

---

## ローカルでの起動（Tursoなし）

### 前提
- Node.js 18以上

### 手順
```bash
npm install
npm start
# → http://localhost:3000
```

環境変数 `TURSO_URL` を設定しない場合、`./data/rulilura.db` にローカルSQLiteファイルを自動作成します。

---

## Turso セットアップ

### 1. Turso CLIをインストール
```bash
# macOS / Linux
curl -sSfL https://get.tur.so/install.sh | bash

# Windows (scoop)
scoop bucket add turso https://github.com/tursodatabase/scoop-bucket.git
scoop install turso
```

### 2. ログイン & DBを作成
```bash
turso auth login

# DBを作成（名前は任意）
turso db create rulilura-db

# 接続URLを確認
turso db show rulilura-db --url
# → libsql://rulilura-db-xxxx.turso.io

# 認証トークンを発行
turso db tokens create rulilura-db
# → eyJhbGciOi...（長い文字列）
```

### 3. ローカルでTursoを使って起動
```bash
TURSO_URL=libsql://rulilura-db-xxxx.turso.io \
TURSO_AUTH_TOKEN=eyJhbGciOi... \
npm start
```

---

## Renderへのデプロイ（Turso使用）

### 1. GitHubにpush済みであること

### 2. Renderでサービス作成
1. [render.com](https://render.com) → New → Web Service
2. GitHubリポジトリを選択
3. 以下を設定：
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Instance Type: **Free**

### 3. 環境変数を設定
| Key | Value |
|-----|-------|
| `JWT_SECRET` | ランダムな文字列（例: `openssl rand -hex 32` の出力） |
| `NODE_ENV` | `production` |
| `TURSO_URL` | `libsql://rulilura-db-xxxx.turso.io` |
| `TURSO_AUTH_TOKEN` | Tursoで発行したトークン |

### 4. Deploy
「Create Web Service」→ 2〜3分でデプロイ完了。  
Diskは不要です（データはTursoに保存されます）。

---

## ccfoliaへのインポート方法

1. キャラクターカードの「ccfolia」ボタンをクリック
2. 表示されたJSONをコピー
3. ccfoliaでルームを開き、コマを右クリック →「JSONからインポート」
4. コピーしたJSONを貼り付け

---

## ファイル構成

```
rulilura/
├── src/
│   ├── server.js           # Expressサーバー
│   ├── db/database.js      # Turso/SQLite接続・初期化
│   ├── middleware/auth.js  # JWT認証
│   └── routes/
│       ├── auth.js         # ログイン・登録API
│       └── crud.js         # 英雄/歌姫/奏甲 CRUD API
├── public/
│   ├── index.html
│   ├── css/style.css
│   └── js/
│       ├── gamedata.js     # スキル定数・ccfolia変換
│       ├── api.js          # API通信・認証
│       ├── hero-form.js    # 英雄フォーム
│       ├── singer-form.js  # 歌姫フォーム
│       ├── armor-form.js   # 奏甲フォーム
│       └── app.js          # メインアプリ
├── render.yaml
├── package.json
└── README.md
```

## 環境変数一覧

| 変数名 | 必須 | 説明 |
|--------|------|------|
| `TURSO_URL` | 本番のみ | TursoのDB URL（省略時はローカルSQLite） |
| `TURSO_AUTH_TOKEN` | 本番のみ | Tursoの認証トークン |
| `JWT_SECRET` | 推奨 | JWTの署名キー（省略時はデフォルト値） |
| `PORT` | 任意 | サーバーポート（デフォルト3000） |
