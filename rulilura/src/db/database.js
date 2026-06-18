const { createClient } = require('@libsql/client');
const path = require('path');
const fs   = require('fs');

// ローカルSQLite用のdataフォルダを確実に作成する
const dataDir = path.join(__dirname, '../../data');
if (!process.env.TURSO_URL && !fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 環境変数からTurso接続情報を取得
// ローカル開発時は TURSO_URL を省略するとローカルSQLiteファイルを使用
// @libsql/client はローカルファイルに絶対パスが必要なため file:// 形式で渡す
const localDbPath = path.join(dataDir, 'rulilura.db').replace(/\\/g, '/');
const localUrl    = `file:${localDbPath}`;
const url         = process.env.TURSO_URL || localUrl;
const authToken   = process.env.TURSO_AUTH_TOKEN || undefined;

const client = createClient({ url, authToken });

// テーブル初期化（非同期）
async function initDb() {
  await client.executeMultiple(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS heroes (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      is_public INTEGER NOT NULL DEFAULT 0,
      share_token TEXT UNIQUE,
      data TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS singers (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      hero_id TEXT,
      is_public INTEGER NOT NULL DEFAULT 0,
      share_token TEXT UNIQUE,
      data TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (hero_id) REFERENCES heroes(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS armors (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      hero_id TEXT,
      singer_id TEXT,
      is_public INTEGER NOT NULL DEFAULT 0,
      share_token TEXT UNIQUE,
      data TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (hero_id) REFERENCES heroes(id) ON DELETE SET NULL,
      FOREIGN KEY (singer_id) REFERENCES singers(id) ON DELETE SET NULL
    );
  `);
}

/**
 * SELECT 複数行
 * @returns {Promise<Array>}
 */
async function all(sql, args = []) {
  const result = await client.execute({ sql, args });
  return result.rows.map(rowToObj);
}

/**
 * SELECT 1行
 * @returns {Promise<Object|null>}
 */
async function get(sql, args = []) {
  const result = await client.execute({ sql, args });
  return result.rows.length ? rowToObj(result.rows[0]) : null;
}

/**
 * INSERT / UPDATE / DELETE
 * @returns {Promise<{lastInsertRowid, rowsAffected}>}
 */
async function run(sql, args = []) {
  const result = await client.execute({ sql, args });
  return { lastInsertRowid: result.lastInsertRowid, rowsAffected: result.rowsAffected };
}

// Tursoの行オブジェクトをプレーンなオブジェクトに変換
function rowToObj(row) {
  const obj = {};
  for (const [key, val] of Object.entries(row)) {
    obj[key] = typeof val === 'bigint' ? Number(val) : val;
  }
  return obj;
}

module.exports = { initDb, all, get, run };
