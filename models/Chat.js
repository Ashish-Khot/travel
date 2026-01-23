const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
  guideId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  touristId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  messages: [
    {
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
    }
  ]
}, { timestamps: true });

ChatSchema.index({ guideId: 1, touristId: 1 }, { unique: true });

module.exports = mongoose.model('Chat', ChatSchema);
