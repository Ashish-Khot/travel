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
    socket.on('joinChatRoom', ({ guideId, touristId }) => {
      const room = `chat_${guideId}_${touristId}`;
      socket.join(room);
    });

    socket.on('chatMessage', async ({ guideId, touristId, senderId, content }) => {
      const message = {
        sender: senderId,
        text: content,
        sentAt: new Date()
      };
      // Save message to Chat model
      let chat = await Chat.findOne({ guideId, touristId });
      if (!chat) {
        chat = new Chat({ guideId, touristId, messages: [] });
      }
      chat.messages.push(message);
      await chat.save();
      const room = `chat_${guideId}_${touristId}`;
      io.to(room).emit('newMessage', message);
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
