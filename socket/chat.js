const socketio = require('socket.io');
const Booking = require('../models/Booking');
const Chat = require('../models/Chat');

function setupSocket(server) {
  const io = socketio(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });
  setupSocket.ioInstance = io;

  io.on('connection', (socket) => {
    // For chat rooms (per Chat model, guide-tourist pair)

    // Join chat room by chatId (for direct chat)
    socket.on('joinRoom', async ({ chatId, userId }) => {
      const chat = await Chat.findById(chatId);
      if (chat && (chat.touristId.toString() === userId || chat.guideId.toString() === userId)) {
        socket.join(`chat_${chatId}`);
      }
    });

    // Typing indicator
    socket.on('typing', ({ bookingId, userId }) => {
      socket.to(`chat_${bookingId}`).emit('typing', { userId });
    });

    // Send chat message (with access and status enforcement)
    socket.on('chatMessage', async ({ chatId, senderId, content, messageType = 'TEXT', senderRole }) => {
      const chat = await Chat.findById(chatId);
      if (!chat) return;
      if (![chat.touristId.toString(), chat.guideId.toString()].includes(senderId)) return;
      // Content filter
      const containsPersonalInfo = (content) => {
        const emailRegex = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
        const phoneRegex = /\b\d{10,}\b/;
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return emailRegex.test(content) || phoneRegex.test(content) || urlRegex.test(content);
      };
      if (containsPersonalInfo(content)) return;
      // Rate limiting (max 5 messages in 10s)
      const Message = require('../models/Message');
      const since = require('moment')().subtract(10, 'seconds').toDate();
      const recentCount = await Message.countDocuments({
        chatId: chat._id,
        senderId,
        createdAt: { $gte: since }
      });
      if (recentCount >= 5) return;
      // Save message
      const msg = await Message.create({
        chatId: chat._id,
        senderId,
        senderRole,
        messageType,
        content,
        isRead: false
      });
      io.to(`chat_${chatId}`).emit('newMessage', msg);
    });

    // Read receipt
    socket.on('readMessages', async ({ bookingId, userId }) => {
      const chat = await Chat.findOne({ bookingId });
      if (!chat) return;
      const Message = require('../models/Message');
      await Message.updateMany({ chatId: chat._id, isRead: false, senderId: { $ne: userId } }, { isRead: true });
      io.to(`chat_${bookingId}`).emit('messagesRead', { userId });
    });

    // For guide dashboard real-time booking updates
    socket.on('joinGuideRoom', ({ guideId }) => {
      if (guideId) {
        socket.join(`guide_${guideId}`);
      }
    });

    // For tourist dashboard real-time booking updates
    socket.on('joinTouristRoom', ({ touristId }) => {
      if (touristId) {
        socket.join(`tourist_${touristId}`);
      }
    });
  });

  // Expose a function to emit booking updates to a guide
  io.emitBookingUpdate = (guideId, booking) => {
    if (guideId) {
      io.to(`guide_${guideId}`).emit('bookingUpdate', { guideId, booking });
    }
    if (booking && booking.touristId) {
      io.to(`tourist_${booking.touristId.toString()}`).emit('bookingUpdate', { touristId: booking.touristId.toString(), booking });
    }
  };
}

module.exports = setupSocket;
