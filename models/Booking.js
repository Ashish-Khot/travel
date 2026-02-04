const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true
  },
  sentAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const BookingSchema = new mongoose.Schema({
  touristId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  guideId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startDateTime: {
    type: Date,
    required: true
  },
  endDateTime: {
    type: Date,
    required: true
  },
  destination: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending',
    required: true
  },
  // Review request system fields
  reviewRequestSent: { type: Boolean, default: false },
  reviewRequestMessage: { type: String, default: '' },
  reviewRequestStatus: { type: String, enum: ['accepted', 'declined', ''], default: '' },
  messages: [MessageSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Booking', BookingSchema);
