const express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { authenticate } = require('../middleware/auth');
const { sarImages } = require('../data/mockData');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
  filename: (req, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname)}`),
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = ['.png', '.jpg', '.jpeg', '.tif', '.tiff'];
    cb(null, allowed.includes(path.extname(file.originalname).toLowerCase()));
  },
  limits: { fileSize: 100 * 1024 * 1024 },
});

router.get('/', authenticate, (req, res) => res.json(sarImages));

router.post('/upload', authenticate, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No valid file uploaded' });

  const newSar = {
    id: uuidv4(),
    displayName: req.file.originalname,
    type: 'YOLO',
    detections: Math.floor(Math.random() * 5) + 1,
    darkShips: Math.floor(Math.random() * 2),
    timestamp: new Date().toISOString(),
    status: 'analyzed',
    url: `/uploads/${req.file.filename}`,
  };

  sarImages.unshift(newSar);
  res.json(newSar);
});

module.exports = router;
