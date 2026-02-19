
const express = require('express');
const Tourist = require('../models/Tourist');
const { verifyToken } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

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
    // Update avatar in Tourist collection
    const tourist = await Tourist.findOneAndUpdate(
      { userId: req.params.userId },
      { avatar: avatarUrl },
      { new: true, upsert: true }
    );
    res.json({ avatar: avatarUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get tourist profile (by userId)
router.get('/:userId', verifyToken, async (req, res) => {
  try {
    const tourist = await Tourist.findOne({ userId: req.params.userId });
    if (!tourist) return res.status(404).json({ error: 'Tourist profile not found' });
    res.json(tourist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create or update tourist profile
router.put('/:userId', verifyToken, async (req, res) => {
  try {
    // Remove any duplicate entries for this userId except the first one
    const allTourists = await Tourist.find({ userId: req.params.userId });
    if (allTourists.length > 1) {
      // Keep the first, remove the rest
      const idsToRemove = allTourists.slice(1).map(t => t._id);
      await Tourist.deleteMany({ _id: { $in: idsToRemove } });
    }
    const update = {
      fullName: req.body.fullName,
      avatar: req.body.avatar,
      dob: req.body.dob,
      gender: req.body.gender,
      language: req.body.language,
      nationality: req.body.nationality,
      interests: req.body.interests,
      phone: req.body.phone,
      userId: req.params.userId
    };
    const tourist = await Tourist.findOneAndUpdate(
      { userId: req.params.userId },
      update,
      { new: true, upsert: true }
    );
    res.json(tourist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
