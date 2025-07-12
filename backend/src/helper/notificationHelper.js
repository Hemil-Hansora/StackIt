import { User } from "../models";
import { emitNotification } from "../socket";

export const createNotificationForEvent = async (eventType, eventData) => {
  try {
    let notification;

    switch (eventType) {
      case 'ANSWER':
        notification = await handleAnswerNotification(eventData);
        break;
      case 'COMMENT':
        notification = await handleCommentNotification(eventData);
        break;
      case 'MENTION':
        notification = await handleMentionNotification(eventData);
        break;
      default:
        throw new Error(`Unknown event type: ${eventType}`);
    }

    if (notification) {
      // Emit real-time notification
      emitNotification(notification.recipientId, notification);
    }

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Handle answer notifications
const handleAnswerNotification = async ({ questionId, answerId, answerUserId, questionOwnerId }) => {
  // Don't notify if user answers their own question
  if (answerUserId === questionOwnerId) {
    return null;
  }

  const answerUser = await User.findById(answerUserId);
  
  const notification = new Notification({
    recipientId: questionOwnerId,
    type: 'ANSWER',
    message: `${answerUser.username} answered your question`,
    link: `/questions/${questionId}#answer-${answerId}`
  });

  await notification.save();
  await notification.populate('recipientId', 'username email');

  return notification;
};

// Handle comment notifications
const handleCommentNotification = async ({ answerId, commentId, commentUserId, answerOwnerId }) => {
  // Don't notify if user comments on their own answer
  if (commentUserId === answerOwnerId) {
    return null;
  }

  const commentUser = await User.findById(commentUserId);
  
  const notification = new Notification({
    recipientId: answerOwnerId,
    type: 'COMMENT',
    message: `${commentUser.username} commented on your answer`,
    link: `/questions/${answerId}#comment-${commentId}`
  });

  await notification.save();
  await notification.populate('recipientId', 'username email');

  return notification;
};

// Handle mention notifications
const handleMentionNotification = async ({ mentionedUserId, mentionerUserId, contentType, contentId, questionId }) => {
  // Don't notify if user mentions themselves
  if (mentionerUserId === mentionedUserId) {
    return null;
  }

  const mentionerUser = await User.findById(mentionerUserId);
  
  const notification = new Notification({
    recipientId: mentionedUserId,
    type: 'MENTION',
    message: `${mentionerUser.username} mentioned you in ${contentType}`,
    link: `/questions/${questionId}#${contentType}-${contentId}`
  });

  await notification.save();
  await notification.populate('recipientId', 'username email');

  return notification;
};

// Helper function to extract mentions from text
export const extractMentions = (text) => {
  const mentionRegex = /@(\w+)/g;
  const mentions = [];
  let match;

  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push(match[1]); // Extract username without @
  }

  return [...new Set(mentions)]; // Remove duplicates
};

// Helper function to get user IDs from usernames
export const getUserIdsByUsernames = async (usernames) => {
  const users = await User.find({ username: { $in: usernames } });
  return users.map(user => user._id);
};