const express = require('express');
const User = require('../models/User');
const Guide = require('../models/Guide');
const Travelogue = require('../models/Travelogue');
const Chat = require('../models/Chat');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Admin dashboard stats
router.get('/dashboard-stats', verifyToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const [touristCount, guideCount, hotelCount, hospitalCount, travelogueCount, chatCount, pendingGuides] = await Promise.all([
      User.countDocuments({ role: 'tourist' }),
      User.countDocuments({ role: 'guide' }),
      User.countDocuments({ role: 'hotel' }),
      User.countDocuments({ role: 'hospital' }),
      Travelogue.countDocuments({}),
      Chat.countDocuments({ status: 'ACTIVE' }),
      Guide.countDocuments({ approved: false, rejected: false })
    ]);
    res.json({
      touristCount,
      guideCount,
      hotelCount,
      hospitalCount,
      travelogueCount,
      chatCount,
      pendingGuides
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
