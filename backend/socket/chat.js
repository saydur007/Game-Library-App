const jwt     = require('jsonwebtoken');
const Message = require('../models/Message');

const onlineUsers = new Map(); // userId (string) → socketId

function initChat(io) {
  // Authenticate every socket connection via token in handshake
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));
    try {
      socket.user = jwt.verify(token, process.env.JWT_SECRET);
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = String(socket.user.id);
    onlineUsers.set(userId, socket.id);
    socket.join(userId); // personal room

    io.emit('users_online', Array.from(onlineUsers.keys()));

    socket.on('send_message', async ({ recipientId, content }) => {
      if (!content?.trim() || !recipientId) return;
      try {
        const message = await Message.create({
          senderId:    socket.user.id,
          recipientId,
          content:     content.trim()
        });
        const payload = {
          _id:         message._id,
          senderId:    String(socket.user.id),
          senderName:  socket.user.username,
          recipientId: String(recipientId),
          content:     message.content,
          createdAt:   message.createdAt
        };
        io.to(String(recipientId)).emit('private_message', payload);
        socket.emit('message_sent', payload);
      } catch {
        socket.emit('message_error', { error: 'Failed to send message' });
      }
    });

    socket.on('disconnect', () => {
      onlineUsers.delete(userId);
      io.emit('users_online', Array.from(onlineUsers.keys()));
    });
  });
}

module.exports = { initChat };
