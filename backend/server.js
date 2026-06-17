const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

app.use(cors({ origin: ['http://localhost:5150', 'http://127.0.0.1:5150'] }));
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

app.use('/api/auth',         require('./routes/auth'));
app.use('/api/vessels',      require('./routes/vessels'));
app.use('/api/alerts',       require('./routes/alerts'));
app.use('/api/analytics',    require('./routes/analytics'));
app.use('/api/sar',          require('./routes/sar'));
app.use('/api/intelligence', require('./routes/intelligence'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

app.listen(PORT, () => {
  console.log(`Alexandria Port C2 backend running on http://localhost:${PORT}`);
});
