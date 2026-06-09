const { v4: uuidv4 } = require('uuid');
const db = require('../db/database');

/**
 * テーブル名に対応するCRUDルーターを生成する
 * table: 'heroes' | 'singers' | 'armors'
 */
function createCrudRouter(table) {
  const express = require('express');
  const router = express.Router();
  const { authRequired, authOptional } = require('../middleware/auth');

  // 一覧（自分のもの）
  router.get('/', authRequired, (req, res) => {
    const rows = db.prepare(`SELECT * FROM ${table} WHERE user_id = ? ORDER BY updated_at DESC`).all(req.user.id);
    res.json(rows.map(r => ({ ...r, data: JSON.parse(r.data), is_public: !!r.is_public })));
  });

  // 公開一覧（全ユーザーの公開データ）
  router.get('/public', (req, res) => {
    const rows = db.prepare(
      `SELECT ${table}.*, users.username FROM ${table}
       JOIN users ON ${table}.user_id = users.id
       WHERE ${table}.is_public = 1
       ORDER BY ${table}.updated_at DESC LIMIT 100`
    ).all();
    res.json(rows.map(r => ({ ...r, data: JSON.parse(r.data), is_public: true })));
  });

  // 共有トークンで取得（公開/非公開問わずアクセス可）
  router.get('/share/:token', (req, res) => {
    const row = db.prepare(
      `SELECT ${table}.*, users.username FROM ${table}
       JOIN users ON ${table}.user_id = users.id
       WHERE ${table}.share_token = ?`
    ).get(req.params.token);
    if (!row) return res.status(404).json({ error: '見つかりません' });
    res.json({ ...row, data: JSON.parse(row.data), is_public: !!row.is_public });
  });

  // 単件取得
  router.get('/:id', authOptional, (req, res) => {
    const row = db.prepare(
      `SELECT ${table}.*, users.username FROM ${table}
       JOIN users ON ${table}.user_id = users.id
       WHERE ${table}.id = ?`
    ).get(req.params.id);
    if (!row) return res.status(404).json({ error: '見つかりません' });
    const isOwner = req.user && req.user.id === row.user_id;
    if (!row.is_public && !isOwner) return res.status(403).json({ error: 'アクセス権がありません' });
    res.json({ ...row, data: JSON.parse(row.data), is_public: !!row.is_public });
  });

  // 作成
  router.post('/', authRequired, (req, res) => {
    const { data, is_public, hero_id, singer_id } = req.body;
    if (!data) return res.status(400).json({ error: 'dataは必須です' });
    const id = uuidv4();
    const shareToken = uuidv4();
    const now = new Date().toISOString();

    const cols = ['id', 'user_id', 'is_public', 'share_token', 'data', 'created_at', 'updated_at'];
    const vals = [id, req.user.id, is_public ? 1 : 0, shareToken, JSON.stringify(data), now, now];

    if (table === 'singers' || table === 'armors') {
      cols.push('hero_id');
      vals.push(hero_id || null);
    }
    if (table === 'armors') {
      cols.push('singer_id');
      vals.push(singer_id || null);
    }

    const placeholders = cols.map(() => '?').join(', ');
    db.prepare(`INSERT INTO ${table} (${cols.join(', ')}) VALUES (${placeholders})`).run(...vals);

    const created = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(id);
    res.status(201).json({ ...created, data: JSON.parse(created.data), is_public: !!created.is_public });
  });

  // 更新
  router.put('/:id', authRequired, (req, res) => {
    const row = db.prepare(`SELECT * FROM ${table} WHERE id = ? AND user_id = ?`).get(req.params.id, req.user.id);
    if (!row) return res.status(404).json({ error: '見つかりません' });

    const { data, is_public, hero_id, singer_id } = req.body;
    const now = new Date().toISOString();

    let sql = `UPDATE ${table} SET data = ?, is_public = ?, updated_at = ?`;
    const params = [JSON.stringify(data !== undefined ? data : JSON.parse(row.data)), is_public !== undefined ? (is_public ? 1 : 0) : row.is_public, now];

    if (table === 'singers' || table === 'armors') {
      sql += ', hero_id = ?';
      params.push(hero_id !== undefined ? hero_id : row.hero_id);
    }
    if (table === 'armors') {
      sql += ', singer_id = ?';
      params.push(singer_id !== undefined ? singer_id : row.singer_id);
    }

    sql += ' WHERE id = ?';
    params.push(req.params.id);

    db.prepare(sql).run(...params);
    const updated = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(req.params.id);
    res.json({ ...updated, data: JSON.parse(updated.data), is_public: !!updated.is_public });
  });

  // 削除
  router.delete('/:id', authRequired, (req, res) => {
    const row = db.prepare(`SELECT id FROM ${table} WHERE id = ? AND user_id = ?`).get(req.params.id, req.user.id);
    if (!row) return res.status(404).json({ error: '見つかりません' });
    db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(req.params.id);
    res.json({ ok: true });
  });

  return router;
}

module.exports = { createCrudRouter };
