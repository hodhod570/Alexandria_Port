const express = require('express');
const { authenticate } = require('../middleware/auth');
const { vessels } = require('../data/mockData');

const router = express.Router();

router.get('/', authenticate, (req, res) => {
  const { search } = req.query;
  let result = vessels;
  if (search) {
    const q = search.toLowerCase();
    result = vessels.filter(v =>
      v.name.toLowerCase().includes(q) ||
      v.mmsi.includes(q) ||
      (v.imo && v.imo.includes(q))
    );
  }
  res.json(result);
});

router.get('/:id', authenticate, (req, res) => {
  const vessel = vessels.find(v => v.id === req.params.id);
  if (!vessel) return res.status(404).json({ error: 'Vessel not found' });
  res.json(vessel);
});

module.exports = router;
