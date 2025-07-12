import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

let io;
const connectedUsers = new Map(); // userId -> socketId mapping

export const initializeWebSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      credentials: true
    }
  });

  // Authentication middleware for WebSocket
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.user.username} connected with socket ID: ${socket.id}`);
    
    // Store user connection
    connectedUsers.set(socket.userId, socket.id);
    
    // Join user to their personal room
    socket.join(`user_${socket.userId}`);
    
    // Send initial unread count
    sendUnreadCount(socket.userId);

    // Handle client requesting notifications
    socket.on('get_notifications', async (data) => {
      try {
        const { page = 1, limit = 20 } = data;
        const notifications = await Notification.find({ recipientId: socket.userId })
          .populate('recipientId', 'username email')
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit);

        socket.emit('notifications_data', {
          notifications,
          page,
          hasMore: notifications.length === limit
        });
      } catch (error) {
        socket.emit('error', { message: 'Failed to fetch notifications' });
      }
    });

    // Handle marking notification as read
    socket.on('mark_notification_read', async (notificationId) => {
      try {
        await Notification.findOneAndUpdate(
          { _id: notificationId, recipientId: socket.userId },
          { isRead: true }
        );
        
        // Send updated unread count
        sendUnreadCount(socket.userId);
        
        socket.emit('notification_marked_read', { notificationId });
      } catch (error) {
        socket.emit('error', { message: 'Failed to mark notification as read' });
      }
    });

    // Handle marking all notifications as read
    socket.on('mark_all_notifications_read', async () => {
      try {
        await Notification.updateMany(
          { recipientId: socket.userId, isRead: false },
          { isRead: true }
        );
        
        socket.emit('all_notifications_marked_read');
        sendUnreadCount(socket.userId);
      } catch (error) {
        socket.emit('error', { message: 'Failed to mark all notifications as read' });
      }
    });

    // Handle user typing (for real-time features)
    socket.on('user_typing', (data) => {
      socket.to(`question_${data.questionId}`).emit('user_typing', {
        userId: socket.userId,
        username: socket.user.username,
        isTyping: data.isTyping
      });
    });

    // Handle joining question room for real-time updates
    socket.on('join_question', (questionId) => {
      socket.join(`question_${questionId}`);
    });

    // Handle leaving question room
    socket.on('leave_question', (questionId) => {
      socket.leave(`question_${questionId}`);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User ${socket.user.username} disconnected`);
      connectedUsers.delete(socket.userId);
    });
  });

  return io;
};

export const emitNotification = (recipientId, notification) => {
  if (!io) {
    console.error('WebSocket server not initialized');
    return;
  }

  const recipientIdStr = recipientId.toString();
  
  // Emit to user's personal room
  io.to(`user_${recipientIdStr}`).emit('new_notification', notification);
  
  // Send updated unread count
  sendUnreadCount(recipientIdStr);
};

// Function to send unread count to user
const sendUnreadCount = async (userId) => {
  try {
    const unreadCount = await Notification.countDocuments({
      recipientId: userId,
      isRead: false
    });

    io.to(`user_${userId}`).emit('unread_count_update', { unreadCount });
  } catch (error) {
    console.error('Error sending unread count:', error);
  }
};

// Function to emit to question room (for real-time question updates)
export const emitToQuestionRoom = (questionId, event, data) => {
  if (!io) {
    console.error('WebSocket server not initialized');
    return;
  }

  io.to(`question_${questionId}`).emit(event, data);
};

// Function to get online users count
export const getOnlineUsersCount = () => {
  return connectedUsers.size;
};

// Function to check if user is online
export const isUserOnline = (userId) => {
  return connectedUsers.has(userId.toString());
};