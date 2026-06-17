const express = require('express');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

const ADMIN_KEYPASS = 'ALEX-PORT-2024';

const USERS = [
  { id: '1', username: 'admin', password: 'admin123', baseRole: 'admin' },
  { id: '2', username: 'operator', password: 'port2024', baseRole: 'operator' },
  { id: '3', username: 'user', password: 'user123', baseRole: 'operator' },
];

router.post('/login', (req, res) => {
  const { username, password, keypass } = req.body;

  const user = USERS.find(u => u.username === username && u.password === password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  let role = user.baseRole;

  if (keypass !== undefined && keypass !== '') {
    if (keypass !== ADMIN_KEYPASS) {
      return res.status(401).json({ error: 'Invalid admin keypass' });
    }
    role = 'admin';
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, role },
    JWT_SECRET,
    { expiresIn: '8h' }
  );

  res.json({ token, user: { id: user.id, username: user.username, role } });
});

module.exports = router;
