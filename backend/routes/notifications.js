const express = require('express');
  const router = express.Router();
  const auth = require('../middleware/auth');
  const Notification = require('../models/Notification');

  // Helper function to create a notification
  const createNotification = async (recipientId, message, type = 'info') => {
    try {
      const notification = new Notification({
        recipientId,
        message,
        type,
      });
      await notification.save();
      return notification;
    } catch (err) {
      console.error('Error creating notification:', err.message);
      throw err;
    }
  };

  // Get Unread Notifications for the Authenticated User
  router.get('/', auth, async (req, res) => {
    try {
      const notifications = await Notification.find({ recipientId: req.user.id, isRead: false })
        .sort({ createdAt: -1 });
      res.json(notifications);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Mark a Notification as Read
  router.put('/:id/read', auth, async (req, res) => {
    const { id } = req.params;
    try {
      const notification = await Notification.findOne({ _id: id, recipientId: req.user.id });
      if (!notification) {
        return res.status(404).json({ error: 'Notification not found' });
      }
      notification.isRead = true;
      await notification.save();
      res.json({ message: 'Notification marked as read' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Mark All Notifications as Read
  router.put('/read-all', auth, async (req, res) => {
    try {
      await Notification.updateMany(
        { recipientId: req.user.id, isRead: false },
        { isRead: true }
      );
      res.json({ message: 'All notifications marked as read' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Export the router as default and createNotification as a named export
  module.exports = router;
  module.exports.createNotification = createNotification;