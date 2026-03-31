const express = require('express');
const Message = require('../models/Message');
const User    = require('../models/User');
const auth    = require('../middleware/auth');

const router = express.Router();

// GET /api/messages/users — all users except self (for DM user list)
router.get('/users', auth, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.id } }).select('username _id');
    res.json({ success: true, data: users });
  } catch {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/messages/:userId — conversation history with a specific user
router.get('/:userId', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { senderId: req.user.id,       recipientId: req.params.userId },
        { senderId: req.params.userId, recipientId: req.user.id }
      ]
    }).sort({ createdAt: 1 }).limit(100);

    // Mark received messages as read
    await Message.updateMany(
      { senderId: req.params.userId, recipientId: req.user.id, read: false },
      { read: true }
    );

    res.json({ success: true, data: messages });
  } catch {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
