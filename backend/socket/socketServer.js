import User from '../models/User.js';

const onlineUsers = new Map();

export const configureSocket = (io) => {
  io.on('connection', (socket) => {
    socket.on('user:online', async (userId) => {
      onlineUsers.set(userId, socket.id);
      socket.userId = userId;
      await User.findByIdAndUpdate(userId, { lastSeen: new Date() });
      io.emit('online:users', Array.from(onlineUsers.keys()));
    });

    socket.on('typing:start', ({ to, from, groupId }) => {
      if (groupId) {
        socket.to(`group:${groupId}`).emit('typing:start', { from, groupId });
        return;
      }
      const targetSocket = onlineUsers.get(to);
      if (targetSocket) {
        io.to(targetSocket).emit('typing:start', { from });
      }
    });

    socket.on('typing:stop', ({ to, from, groupId }) => {
      if (groupId) {
        socket.to(`group:${groupId}`).emit('typing:stop', { from, groupId });
        return;
      }
      const targetSocket = onlineUsers.get(to);
      if (targetSocket) {
        io.to(targetSocket).emit('typing:stop', { from });
      }
    });

    socket.on('group:join', (groupId) => {
      socket.join(`group:${groupId}`);
    });

    socket.on('message:send', ({ message, receiver, groupId }) => {
      if (groupId) {
        socket.to(`group:${groupId}`).emit('message:receive', { message, groupId });
        return;
      }

      const targetSocket = onlineUsers.get(receiver);
      if (targetSocket) {
        io.to(targetSocket).emit('message:receive', { message });
      }
    });

    socket.on('message:seen', ({ messageId, senderId }) => {
      const targetSocket = onlineUsers.get(senderId);
      if (targetSocket) {
        io.to(targetSocket).emit('message:seen', { messageId });
      }
    });

    socket.on('disconnect', async () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        await User.findByIdAndUpdate(socket.userId, { lastSeen: new Date() });
      }
      io.emit('online:users', Array.from(onlineUsers.keys()));
    });
  });
};
