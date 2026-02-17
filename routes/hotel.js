const express = require("express");
const router = express.Router();
const Hotel = require("../models/Hotel");
const { verifyToken } = require("../middleware/auth");
const multer = require("multer");
const path = require("path");

// Set up multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/hotelImages'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Get hotel profile by userId
router.get("/profile/:userId", verifyToken, async (req, res) => {
  try {
    const hotel = await Hotel.findOne({ user: req.params.userId });
    if (!hotel) return res.status(404).json({ error: 'Hotel not found' });
    res.json(hotel);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create or update hotel profile
router.put("/profile/:userId", verifyToken, async (req, res) => {
  try {
    const { name, email, phone, address, amenities, images } = req.body;
    // Basic validation
    if (!name || !email || !phone) {
      return res.status(400).json({ error: 'Name, email, and phone are required.' });
    }
    // Update Hotel collection only
    const hotel = await Hotel.findOneAndUpdate(
      { user: req.params.userId },
      {
        name,
        email,
        phone,
        address,
        amenities,
        images,
        updatedAt: Date.now()
      },
      { new: true, upsert: true }
    );
    res.json(hotel);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add image URL
router.post("/images/url/:userId", verifyToken, async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'No URL provided' });
    const hotel = await Hotel.findOneAndUpdate(
      { user: req.params.userId },
      { $push: { images: url }, $set: { updatedAt: Date.now() } },
      { new: true, upsert: true }
    );
    res.json(hotel.images);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upload image file
router.post("/images/upload/:userId", verifyToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const imageUrl = `/uploads/hotelImages/${req.file.filename}`;
    const hotel = await Hotel.findOneAndUpdate(
      { user: req.params.userId },
      { $push: { images: imageUrl }, $set: { updatedAt: Date.now() } },
      { new: true, upsert: true }
    );
    res.json(hotel.images);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove image
router.delete("/images/:userId", verifyToken, async (req, res) => {
  try {
    const { url } = req.body;
    const hotel = await Hotel.findOneAndUpdate(
      { user: req.params.userId },
      { $pull: { images: url }, $set: { updatedAt: Date.now() } },
      { new: true }
    );
    res.json(hotel.images);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
