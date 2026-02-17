// notifications.js
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const Booking = require('../models/Booking');
const User = require('../models/User');

// In-memory notifications store for demo (replace with DB in production)
const notifications = [];

// Guide triggers a tour completion notification for a tourist
router.post('/guide/complete-tour', verifyToken, async (req, res) => {
  try {
    const { bookingId, message } = req.body;
    const booking = await Booking.findById(bookingId).populate('touristId guideId');
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    // Add notification for the tourist
    notifications.push({
      id: `${Date.now()}_${bookingId}`,
      touristId: booking.touristId._id.toString(),
      guideName: booking.guideId.name,
      tourName: booking.destination,
      message: message || 'Tour is completed. Please confirm and leave a review.',
      bookingId: bookingId,
      status: 'pending',
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Tourist fetches their notifications
router.get('/tourist', verifyToken, async (req, res) => {
  try {
    const touristId = req.user.id;
    const myNotifications = notifications.filter(n => n.touristId === touristId && n.status === 'pending');
    res.json({ notifications: myNotifications });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Tourist responds to a notification (accept/decline)
router.post('/tourist/respond', verifyToken, async (req, res) => {
  try {
    const { notificationId, action } = req.body; // action: 'accept' or 'decline'
    const notif = notifications.find(n => n.id === notificationId);
    if (!notif) return res.status(404).json({ error: 'Notification not found' });
    notif.status = action === 'accept' ? 'accepted' : 'declined';
    // Optionally, trigger review flow or notify guide here
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

