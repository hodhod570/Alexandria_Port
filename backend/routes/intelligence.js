const express = require('express');
const { authenticate } = require('../middleware/auth');
const { integratedFeed, sarImages, vessels } = require('../data/mockData');

const router = express.Router();

router.get('/integrated', authenticate, (req, res) => {
  const { type, severity } = req.query;
  let feed = [...integratedFeed].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  if (type && type !== 'All') {
    feed = feed.filter(f => f.type === type);
  }
  if (severity && severity !== 'All') {
    feed = feed.filter(f => f.severity === severity.toUpperCase());
  }

  res.json({
    feed,
    summary: {
      total: integratedFeed.length,
      aisEvents: integratedFeed.filter(f => f.type === 'AIS').length,
      sarEvents: integratedFeed.filter(f => f.type === 'SAR').length,
      criticalEvents: integratedFeed.filter(f => f.severity === 'CRITICAL').length,
    },
  });
});

module.exports = router;
