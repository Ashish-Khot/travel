// guideAvatar.js - Avatar upload for guides
const express = require('express');
const multer = require('multer');
const path = require('path');
const User = require('../models/User');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Set up multer for avatar uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/avatars'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `guide_${req.user.userId}_${Date.now()}${ext}`);
  }
});
const upload = multer({ storage });

// Avatar upload endpoint for guides
router.post('/avatar', verifyToken, authorizeRoles('guide'), upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    // Update avatar in User collection
    await User.findByIdAndUpdate(req.user.userId, { avatar: avatarUrl });
    res.json({ avatar: avatarUrl });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
