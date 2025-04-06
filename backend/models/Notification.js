const mongoose = require('mongoose');

  const notificationSchema = new mongoose.Schema({
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['info', 'alert', 'warning'],
      default: 'info',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  }, { timestamps: true });

  module.exports = mongoose.model('Notification', notificationSchema);