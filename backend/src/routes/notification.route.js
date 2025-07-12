import express from 'express';
import {
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getUnreadNotificationCount
} from '../controllers/notification.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get user notifications
router.get('/', getUserNotifications);

// Get unread count
router.get('/unread-count', getUnreadNotificationCount);

// Mark all as read
router.put('/read-all', markAllNotificationsAsRead);

// Mark specific notification as read
router.put('/:id/read', markNotificationAsRead);

// Delete notification
router.delete('/:id', deleteNotification);

// Create notification (typically for system use)
router.post('/', createNotification);

export default router;