const express = require('express');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { analyticsBase, generateTrend } = require('../data/mockData');

const router = express.Router();

router.get('/', authenticate, requireAdmin, (req, res) => {
  const days = parseInt(req.query.period) || 7;
  const validDays = [7, 30, 90].includes(days) ? days : 7;
  res.json({
    ...analyticsBase,
    detectionTrend: generateTrend(validDays),
    period: validDays,
  });
});

router.get('/export', authenticate, requireAdmin, (req, res) => {
  const { analyticsBase: data } = require('../data/mockData');
  const rows = [
    ['Metric', 'Value'],
    ['Total Alerts', data.totalAlerts],
    ['Dark Ships Detected', data.darkShipsDetected],
    ['Resolved Alerts', data.resolvedAlerts],
    ['Active Vessels', data.activeVessels],
    [],
    ['Severity', 'Count'],
    ...data.severityDistribution.map(s => [s.severity, s.count]),
    [],
    ['Alert Type', 'Count'],
    ...data.alertTypes.map(t => [t.type, t.count]),
  ];
  const csv = rows.map(r => r.join(',')).join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="analytics.csv"');
  res.send(csv);
});

module.exports = router;
