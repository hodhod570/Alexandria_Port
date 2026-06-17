const express = require('express');
const { authenticate } = require('../middleware/auth');
const { alerts } = require('../data/mockData');

const router = express.Router();

router.get('/', authenticate, (req, res) => {
  const { severity, status, search } = req.query;
  let result = [...alerts];

  if (severity && severity !== 'All') {
    result = result.filter(a => a.severity === severity.toUpperCase());
  }
  if (status && status !== 'All') {
    result = result.filter(a => a.status === status);
  }
  if (search) {
    const q = search.toLowerCase();
    result = result.filter(a =>
      a.title.toLowerCase().includes(q) ||
      (a.vesselName && a.vesselName.toLowerCase().includes(q)) ||
      (a.mmsi && a.mmsi.includes(q))
    );
  }

  res.json(result);
});

router.patch('/:id/status', authenticate, (req, res) => {
  const alert = alerts.find(a => a.id === req.params.id);
  if (!alert) return res.status(404).json({ error: 'Alert not found' });
  const { status } = req.body;
  if (!['Open', 'Acknowledged', 'Resolved'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  alert.status = status;
  res.json(alert);
});

module.exports = router;
