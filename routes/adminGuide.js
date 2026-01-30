const express = require('express');
const Guide = require('../models/Guide');
const User = require('../models/User');
const { verifyToken, authorizeRoles } = require('../middleware/auth');
const nodemailer = require('nodemailer');

const router = express.Router();

// Helper: send email notification
async function sendEmail(to, subject, text) {
  // Configure your email transport here
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  await transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, text });
}

// List pending guides
router.get('/pending', verifyToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const pendingGuides = await Guide.find({ approved: false }).populate('userId');
    res.json({ guides: pendingGuides });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Approve or reject guide
router.post('/action/:id', verifyToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { action } = req.body; // 'approve' or 'reject'
    const guideId = req.params.id;
    const guide = await Guide.findById(guideId).populate('userId');
    if (!guide) return res.status(404).json({ message: 'Guide not found' });
    if (action === 'approve') {
      guide.approved = true;
      await guide.save();
      try {
        await sendEmail(guide.userId.email, 'Guide Application Approved', 'Congratulations! Your guide application has been approved.');
      } catch (emailErr) {
        console.error('Failed to send approval email:', emailErr.message);
        // Optionally, you can log this or notify admin, but don't fail the request
      }
      res.json({ message: 'Guide approved', guide });
    } else if (action === 'reject') {
      try {
        await sendEmail(guide.userId.email, 'Guide Application Rejected', 'Sorry, your guide application has been rejected.');
      } catch (emailErr) {
        console.error('Failed to send rejection email:', emailErr.message);
      }
      guide.rejected = true;
      guide.approved = false;
      await guide.save();
      res.json({ message: 'Guide rejected', guide });
    } else {
      res.status(400).json({ message: 'Invalid action' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
