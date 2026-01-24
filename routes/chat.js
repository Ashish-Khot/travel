const express = require('express');
const moment = require('moment');

const Chat = require('../models/Chat');
const Message = require('../models/Message');
const Booking = require('../models/Booking');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

/* =========================================================
   HELPERS
========================================================= */

// Check if user is part of booking
async function validateChatAccess(user, bookingId) {
	const booking = await Booking.findById(bookingId);
	if (!booking) return { allowed: false, reason: 'Booking not found' };

	if (
		![booking.touristId.toString(), booking.guideId.toString()].includes(
			user.userId
		)
	) {
		return { allowed: false, reason: 'Access denied' };
	}

	return { allowed: true, booking };
}

// Determine chat status
function getChatStatus(booking, chat) {
	const now = moment();

	if (booking.status === 'disputed') return 'LOCKED';
	if (booking.status === 'cancelled') return 'CLOSED';
	if (['confirmed', 'ongoing'].includes(booking.status)) return 'ACTIVE';

	if (
		booking.status === 'completed' &&
		chat.postTourExpiry &&
		now.isBefore(chat.postTourExpiry)
	) {
		return 'POST_TOUR';
	}

	return 'CLOSED';
}

// Content filter (no emails, phones, links)
function containsPersonalInfo(content) {
	const emailRegex = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
	const phoneRegex = /\b\d{10,}\b/;
	const urlRegex = /(https?:\/\/[^\s]+)/gi;

	return (
		emailRegex.test(content) ||
		phoneRegex.test(content) ||
		urlRegex.test(content)
	);
}

/* =========================================================
   DIRECT CHAT (WITHOUT BOOKING)
========================================================= */

// GET /api/chat/direct/:touristId/:guideId
router.get('/direct/:touristId/:guideId', verifyToken, async (req, res) => {
	try {
		const { touristId, guideId } = req.params;

		// Access control
		if (![touristId, guideId].includes(req.user.userId)) {
			return res.status(403).json({ error: 'Access denied' });
		}

		let chat = await Chat.findOne({
			touristId,
			guideId,
			bookingId: null
		});

		if (!chat) {
			chat = await Chat.create({
				touristId,
				guideId,
				bookingId: null,
				status: 'ACTIVE'
			});
		}

		const messages = await Message.find({ chatId: chat._id }).sort({
			createdAt: 1
		});

		res.json({
			chatId: chat._id,
			status: chat.status,
			messages
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Server error' });
	}
});

/* =========================================================
   BOOKING BASED CHAT
========================================================= */

// GET /api/chat/:bookingId
router.get('/:bookingId', verifyToken, async (req, res) => {
	try {
		const { bookingId } = req.params;

		const { allowed, booking, reason } = await validateChatAccess(
			req.user,
			bookingId
		);
		if (!allowed) return res.status(403).json({ error: reason });

		let chat = await Chat.findOne({ bookingId });

		if (!chat) {
			chat = await Chat.create({
				bookingId,
				touristId: booking.touristId,
				guideId: booking.guideId,
				status: 'ACTIVE',
				postTourExpiry: null
			});
		}

		const status = getChatStatus(booking, chat);
		if (chat.status !== status) {
			chat.status = status;
			await chat.save();
		}

		const messages = await Message.find({ chatId: chat._id }).sort({
			createdAt: 1
		});

		res.json({ chat, status, messages });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Server error' });
	}
});

// POST /api/chat/:bookingId/message
router.post('/:bookingId/message', verifyToken, async (req, res) => {
	try {
		const { bookingId } = req.params;
		const { content, messageType = 'TEXT' } = req.body;

		const { allowed, booking, reason } = await validateChatAccess(
			req.user,
			bookingId
		);
		if (!allowed) return res.status(403).json({ error: reason });

		const chat = await Chat.findOne({ bookingId });
		if (!chat) return res.status(404).json({ error: 'Chat not found' });

		const status = getChatStatus(booking, chat);
		if (['CLOSED', 'LOCKED'].includes(status)) {
			return res.status(403).json({ error: 'Chat is not active' });
		}

		if (containsPersonalInfo(content)) {
			return res
				.status(400)
				.json({ error: 'Personal contact info is not allowed' });
		}

		// Rate limit: 5 messages / 10 sec
		const since = moment().subtract(10, 'seconds').toDate();
		const recentCount = await Message.countDocuments({
			chatId: chat._id,
			senderId: req.user.userId,
			createdAt: { $gte: since }
		});

		if (recentCount >= 5) {
			return res
				.status(429)
				.json({ error: 'Too many messages, slow down.' });
		}

		const msg = await Message.create({
			chatId: chat._id,
			senderId: req.user.userId,
			senderRole: req.user.role,
			messageType,
			content,
			isRead: false
		});

		res.json({ message: msg });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Server error' });
	}
});

// GET /api/chat/:bookingId/messages (pagination)
router.get('/:bookingId/messages', verifyToken, async (req, res) => {
	try {
		const { bookingId } = req.params;

		const { allowed, reason } = await validateChatAccess(
			req.user,
			bookingId
		);
		if (!allowed) return res.status(403).json({ error: reason });

		const chat = await Chat.findOne({ bookingId });
		if (!chat) return res.status(404).json({ error: 'Chat not found' });

		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 50;
		const skip = (page - 1) * limit;

		const messages = await Message.find({ chatId: chat._id })
			.sort({ createdAt: 1 })
			.skip(skip)
			.limit(limit);

		res.json({ messages });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Server error' });
	}
});

module.exports = router;
