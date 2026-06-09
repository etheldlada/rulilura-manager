const express = require('express');
const path = require('path');

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
app.listen(PORT, () => console.log(`RuLiLuRa Manager running on http://localhost:${PORT}`));
