const express = require('express');
const path = require('path');
const { initDb } = require('./db/database');

const app = express();
app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname, '../public')));

// ルーター
app.use('/api/auth', require('./routes/auth'));

const { createCrudRouter } = require('./routes/crud');
app.use('/api/heroes',  createCrudRouter('heroes'));
app.use('/api/singers', createCrudRouter('singers'));
app.use('/api/armors',  createCrudRouter('armors'));

// SPA フォールバック
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

const PORT = process.env.PORT || 3000;

// DB初期化してからサーバー起動
initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`RuLiLuRa Manager running on http://localhost:${PORT}`);
      console.log(`DB: ${process.env.TURSO_URL || 'file:./data/rulilura.db (local)'}`);
    });
  })
  .catch(err => {
    console.error('DB初期化に失敗しました:', err);
    process.exit(1);
  });
