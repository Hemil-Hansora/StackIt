import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  // Recipient (Foreign Key)
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Notification Type
  type: {
    type: String,
    enum: ['ANSWER', 'COMMENT', 'MENTION'],
    required: true
  },
  
  // Notification Content
  message: {
    type: String,
    required: [true, 'Notification message is required'],
    maxlength: [255, 'Message cannot exceed 255 characters']
  },
  
  // Read Status
  isRead: {
    type: Boolean,
    default: false
  },
  
  // Link to related content
  link: {
    type: String,
    required: [true, 'Notification link is required']
  }
}, {
  timestamps: true, // This provides createdAt and updatedAt automatically
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
notificationSchema.index({ recipientId: 1, createdAt: -1 });
notificationSchema.index({ recipientId: 1, isRead: 1 });
notificationSchema.index({ type: 1 });

// Virtual for time ago (if needed)
notificationSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diff = now - this.createdAt;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
});

export default mongoose.model('Notification', notificationSchema);
