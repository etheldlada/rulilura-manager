const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db/database');
const { authRequired, authOptional } = require('../middleware/auth');

function createCrudRouter(table) {
  const router = express.Router();
  const endpoint = table; // heroes / singers / armors

  // 自分のキャラ一覧
  router.get('/', authRequired, async (req, res) => {
    try {
      const rows = await db.all(
        `SELECT * FROM ${table} WHERE user_id = ? ORDER BY updated_at DESC`,
        [req.user.id]
      );
      res.json(rows.map(r => ({ ...r, data: JSON.parse(r.data), is_public: !!r.is_public })));
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'サーバーエラー' });
    }
  });

  // 公開一覧
  router.get('/public', async (req, res) => {
    try {
      const rows = await db.all(
        `SELECT ${table}.*, users.username FROM ${table}
         JOIN users ON ${table}.user_id = users.id
         WHERE ${table}.is_public = 1
         ORDER BY ${table}.updated_at DESC LIMIT 100`,
        []
      );
      res.json(rows.map(r => ({ ...r, data: JSON.parse(r.data), is_public: true })));
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'サーバーエラー' });
    }
  });

  // 共有トークンで取得
  router.get('/share/:token', async (req, res) => {
    try {
      const row = await db.get(
        `SELECT ${table}.*, users.username FROM ${table}
         JOIN users ON ${table}.user_id = users.id
         WHERE ${table}.share_token = ?`,
        [req.params.token]
      );
      if (!row) return res.status(404).json({ error: '見つかりません' });
      res.json({ ...row, data: JSON.parse(row.data), is_public: !!row.is_public });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'サーバーエラー' });
    }
  });

  // 単件取得
  router.get('/:id', authOptional, async (req, res) => {
    try {
      const row = await db.get(
        `SELECT ${table}.*, users.username FROM ${table}
         JOIN users ON ${table}.user_id = users.id
         WHERE ${table}.id = ?`,
        [req.params.id]
      );
      if (!row) return res.status(404).json({ error: '見つかりません' });
      const isOwner = req.user && req.user.id === row.user_id;
      if (!row.is_public && !isOwner) return res.status(403).json({ error: 'アクセス権がありません' });
      res.json({ ...row, data: JSON.parse(row.data), is_public: !!row.is_public });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'サーバーエラー' });
    }
  });

  // 作成
  router.post('/', authRequired, async (req, res) => {
    try {
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
      await db.run(
        `INSERT INTO ${table} (${cols.join(', ')}) VALUES (${placeholders})`,
        vals
      );

      const created = await db.get(`SELECT * FROM ${table} WHERE id = ?`, [id]);
      res.status(201).json({ ...created, data: JSON.parse(created.data), is_public: !!created.is_public });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'サーバーエラー' });
    }
  });

  // 更新
  router.put('/:id', authRequired, async (req, res) => {
    try {
      const row = await db.get(
        `SELECT * FROM ${table} WHERE id = ? AND user_id = ?`,
        [req.params.id, req.user.id]
      );
      if (!row) return res.status(404).json({ error: '見つかりません' });

      const { data, is_public, hero_id, singer_id } = req.body;
      const now = new Date().toISOString();
      const newData = data !== undefined ? JSON.stringify(data) : row.data;
      const newPublic = is_public !== undefined ? (is_public ? 1 : 0) : row.is_public;

      let sql = `UPDATE ${table} SET data = ?, is_public = ?, updated_at = ?`;
      const params = [newData, newPublic, now];

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

      await db.run(sql, params);
      const updated = await db.get(`SELECT * FROM ${table} WHERE id = ?`, [req.params.id]);
      res.json({ ...updated, data: JSON.parse(updated.data), is_public: !!updated.is_public });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'サーバーエラー' });
    }
  });

  // 削除
  router.delete('/:id', authRequired, async (req, res) => {
    try {
      const row = await db.get(
        `SELECT id FROM ${table} WHERE id = ? AND user_id = ?`,
        [req.params.id, req.user.id]
      );
      if (!row) return res.status(404).json({ error: '見つかりません' });
      await db.run(`DELETE FROM ${table} WHERE id = ?`, [req.params.id]);
      res.json({ ok: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'サーバーエラー' });
    }
  });

  return router;
}

module.exports = { createCrudRouter };
