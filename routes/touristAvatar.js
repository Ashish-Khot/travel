const express = require('express');
const multer = require('multer');
const path = require('path');
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Set up multer for avatar uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/avatars'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Avatar upload endpoint
router.post('/avatar/:userId', verifyToken, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    const user = await User.findOneAndUpdate(
      { _id: req.params.userId, role: 'tourist' },
      { avatar: avatarUrl },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: 'Tourist not found' });
    res.json({ avatar: avatarUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
