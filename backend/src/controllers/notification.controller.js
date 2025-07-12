import Notification from '../models/Notification.js';
import User from '../models/User.js';
import mongoose from 'mongoose';
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { emitNotification } from './notificationWebSocket.js';

// @desc    Create a new notification
// @route   POST /api/notifications
// @access  Private (system use - typically called by other controllers)
export const createNotification = asyncHandler(async (req, res) => {
  const { recipientId, type, message, link } = req.body;

  // Validate recipient exists
  const recipient = await User.findById(recipientId);
  if (!recipient) {
    throw new ApiError(404, 'Recipient user not found');
  }

  // Create notification
  const notification = new Notification({
    recipientId,
    type,
    message,
    link
  });

  await notification.save();

  // Populate recipient info
  await notification.populate('recipientId', 'username email');

  // Emit real-time notification
  emitNotification(recipientId, notification);

  res.status(201).json(
    new ApiResponse(201, notification, 'Notification created successfully')
  );
});

// @desc    Get all notifications for a user
// @route   GET /api/notifications
// @access  Private
export const getUserNotifications = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  
  // Filter options
  const { isRead, type } = req.query;
  const query = { recipientId: userId };
  
  if (isRead !== undefined) {
    query.isRead = isRead === 'true';
  }
  
  if (type) {
    query.type = type;
  }

  // Get notifications
  const notifications = await Notification.find(query)
    .populate('recipientId', 'username email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  // Get total count
  const totalNotifications = await Notification.countDocuments(query);
  const totalPages = Math.ceil(totalNotifications / limit);

  // Get unread count
  const unreadCount = await Notification.countDocuments({
    recipientId: userId,
    isRead: false
  });

  res.status(200).json(
    new ApiResponse(200, {
      notifications,
      unreadCount,
      pagination: {
        currentPage: page,
        totalPages,
        totalNotifications,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }, 'Notifications retrieved successfully')
  );
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markNotificationAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid notification ID format');
  }

  // Find and update notification
  const notification = await Notification.findOneAndUpdate(
    { _id: id, recipientId: userId },
    { isRead: true },
    { new: true, runValidators: true }
  ).populate('recipientId', 'username email');

  if (!notification) {
    throw new ApiError(404, 'Notification not found or access denied');
  }

  res.status(200).json(
    new ApiResponse(200, notification, 'Notification marked as read')
  );
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
export const markAllNotificationsAsRead = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const updateResult = await Notification.updateMany(
    { recipientId: userId, isRead: false },
    { isRead: true }
  );

  res.status(200).json(
    new ApiResponse(200, {
      modifiedCount: updateResult.modifiedCount
    }, `${updateResult.modifiedCount} notifications marked as read`)
  );
});

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
export const deleteNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid notification ID format');
  }

  // Find and delete notification
  const notification = await Notification.findOneAndDelete({
    _id: id,
    recipientId: userId
  });

  if (!notification) {
    throw new ApiError(404, 'Notification not found or access denied');
  }

  res.status(200).json(
    new ApiResponse(200, {}, 'Notification deleted successfully')
  );
});

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private
export const getUnreadNotificationCount = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const unreadCount = await Notification.countDocuments({
    recipientId: userId,
    isRead: false
  });

  res.status(200).json(
    new ApiResponse(200, { unreadCount }, 'Unread count retrieved successfully')
  );
});
