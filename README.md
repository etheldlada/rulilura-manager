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

## ローカルでの起動

### 前提
- Node.js 18以上

### 手順
```bash
# 依存パッケージのインストール
npm install

# 起動
npm start
# または開発時（ファイル変更を自動反映）
npm run dev
```

ブラウザで `http://localhost:3000` を開く。

---

## Renderへのデプロイ

1. GitHubリポジトリを作成してこのコードをpush
2. [render.com](https://render.com) でアカウント作成
3. "New Web Service" → GitHubリポジトリを選択
4. `render.yaml` が自動的に設定を読み込む
5. デプロイ完了後、発行されたURLにアクセス

> **注意**: Renderの無料プランではディスク永続化が有料機能です。
> 無料プランで試す場合はSQLiteのデータが再デプロイ時にリセットされます。
> 永続化が必要な場合はRenderの有料プラン（Disk付き）か、PlanetScaleなどの外部DBに切り替えてください。

---

## ccfoliaへのインポート方法

1. キャラクターカードの「ccfolia」ボタンをクリック
2. 表示されたJSONをコピー
3. ccfoliaでルームを開き、コマを右クリック →「JSONからインポート」を選択
4. コピーしたJSONを貼り付け

生成されるコマンドの例：
- `剣技 → 1D100<=70 [剣技 スキル20]`
- `攻撃:ロングソード → 1D100<=65 [ロングソード命中]`
- `筋力チェック → 1D100<=52 [筋力チェック 成功値:52]`
- `肉体消耗チェック → 2D10<=9 [肉体消耗チェック 消耗値:9]`

---

## ファイル構成

```
rulilura/
├── src/
│   ├── server.js           # Expressサーバー
│   ├── db/database.js      # SQLite初期化
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
├── data/                   # SQLiteファイル（自動生成）
├── render.yaml
├── package.json
└── README.md
```

---

## API エンドポイント

| メソッド | パス | 説明 |
|--------|------|------|
| POST | /api/auth/register | ユーザー登録 |
| POST | /api/auth/login | ログイン |
| GET | /api/heroes | 自分の英雄一覧 |
| GET | /api/heroes/public | 公開英雄一覧 |
| GET | /api/heroes/share/:token | 共有トークンで取得 |
| GET | /api/heroes/:id | 単件取得 |
| POST | /api/heroes | 英雄作成 |
| PUT | /api/heroes/:id | 英雄更新 |
| DELETE | /api/heroes/:id | 英雄削除 |
| （singers/armorsも同様） | | |
