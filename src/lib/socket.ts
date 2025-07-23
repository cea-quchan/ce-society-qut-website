import { Server as SocketIOServer } from 'socket.io';
import { Server as NetServer } from 'http';
import { logger } from './logger';

interface Notification {
  type: string;
  message: string;
  title?: string;
  data?: Record<string, unknown>;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  createdAt: Date;
}

interface SocketServer extends NetServer {
  io?: SocketIOServer;
}

let io: SocketIOServer;

export const initializeSocket = (server: SocketServer) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL,
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    // Join user's room for notifications
    socket.on('join', (userId: string) => {
      socket.join(`user:${userId}`);
      logger.info(`User ${userId} joined their notification room`);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });

  server.io = io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

export const sendNotification = (userId: string, notification: Notification) => {
  if (!io) {
    logger.error('Socket.IO not initialized');
    return;
  }

  io.to(userId).emit('notification', notification);
  logger.info(`Notification sent to user ${userId}: ${notification.message}`);
};

export const sendMessage = (userId: string, message: Message) => {
  if (!io) {
    logger.error('Socket.IO not initialized');
    return;
  }

  io.to(userId).emit('message', message);
  logger.info(`Message sent to user ${userId}`);
}; 