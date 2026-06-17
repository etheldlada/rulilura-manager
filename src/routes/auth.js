const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../db/database');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// 登録
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'ユーザー名とパスワードは必須です' });
    if (username.length < 3 || username.length > 20) return res.status(400).json({ error: 'ユーザー名は3〜20文字です' });
    if (password.length < 6) return res.status(400).json({ error: 'パスワードは6文字以上です' });
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return res.status(400).json({ error: 'ユーザー名は英数字とアンダースコアのみ使用できます' });

    const existing = await db.get('SELECT id FROM users WHERE username = ?', [username]);
    if (existing) return res.status(409).json({ error: 'このユーザー名は既に使用されています' });

    const hash = bcrypt.hashSync(password, 10);
    const id = uuidv4();
    await db.run('INSERT INTO users (id, username, password_hash) VALUES (?, ?, ?)', [id, username, hash]);

    const token = jwt.sign({ id, username }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, username });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
});

// ログイン
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'ユーザー名とパスワードは必須です' });

    const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: 'ユーザー名またはパスワードが正しくありません' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, username: user.username });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
});

module.exports = router;
