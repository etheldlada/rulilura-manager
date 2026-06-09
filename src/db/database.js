const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const db = new Database(path.join(dbDir, 'rulilura.db'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
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

module.exports = db;
