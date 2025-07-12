import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  // Recipient Information
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Notification Type and Category
  type: {
    type: String,
    enum: [
      'question_answered', 'answer_accepted', 'answer_voted', 'question_voted',
      'comment_added', 'mention', 'follow', 'badge_earned', 'milestone_reached',
      'question_commented', 'answer_commented', 'tag_followed', 'user_followed',
      'question_closed', 'content_flagged', 'system_announcement', 'welcome',
      'weekly_digest', 'trending_content', 'expert_invitation', 'bounty_awarded'
    ],
    required: true
  },
  
  category: {
    type: String,
    enum: ['interaction', 'achievement', 'system', 'social', 'moderation', 'digest'],
    required: true
  },
  
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  
  // Notification Content
  title: {
    type: String,
    required: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  
  message: {
    type: String,
    required: true,
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  
  shortMessage: {
    type: String,
    maxlength: [150, 'Short message cannot exceed 150 characters']
  },
  
  // Rich Content Support
  content: {
    html: String,
    markdown: String,
    template: String,
    templateData: mongoose.Schema.Types.Mixed
  },
  
  // Action and Navigation
  actionUrl: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^\/|^https?:\/\//.test(v);
      },
      message: 'Action URL must be a valid path or URL'
    }
  },
  
  actionText: {
    type: String,
    maxlength: [50, 'Action text cannot exceed 50 characters']
  },
  
  // Related Content References
  relatedContent: {
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question'
    },
    answer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Answer'
    },
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment'
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    tag: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tag'
    }
  },
  
  // Sender Information
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  senderInfo: {
    username: String,
    avatar: String,
    isSystem: {
      type: Boolean,
      default: false
    }
  },
  
  // Notification Status
  status: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'read', 'clicked', 'dismissed', 'failed'],
    default: 'pending'
  },
  
  isRead: {
    type: Boolean,
    default: false
  },
  
  readAt: Date,
  
  isDismissed: {
    type: Boolean,
    default: false
  },
  
  dismissedAt: Date,
  
  // Delivery Tracking
  delivery: {
    inApp: {
      sent: {
        type: Boolean,
        default: false
      },
      sentAt: Date,
      delivered: {
        type: Boolean,
        default: false
      },
      deliveredAt: Date
    },
    email: {
      sent: {
        type: Boolean,
        default: false
      },
      sentAt: Date,
      delivered: {
        type: Boolean,
        default: false
      },
      deliveredAt: Date,
      opened: {
        type: Boolean,
        default: false
      },
      openedAt: Date,
      clicked: {
        type: Boolean,
        default: false
      },
      clickedAt: Date
    },
    push: {
      sent: {
        type: Boolean,
        default: false
      },
      sentAt: Date,
      delivered: {
        type: Boolean,
        default: false
      },
      deliveredAt: Date,
      clicked: {
        type: Boolean,
        default: false
      },
      clickedAt: Date
    },
    sms: {
      sent: {
        type: Boolean,
        default: false
      },
      sentAt: Date,
      delivered: {
        type: Boolean,
        default: false
      },
      deliveredAt: Date
    }
  },
  
  // Scheduling and Timing
  scheduledFor: Date,
  
  expiresAt: Date,
  
  batchId: String, // For grouping related notifications
  
  // Personalization and Context
  personalization: {
    userTimezone: String,
    userLanguage: {
      type: String,
      default: 'en'
    },
    userPreferences: mongoose.Schema.Types.Mixed,
    deviceType: {
      type: String,
      enum: ['desktop', 'mobile', 'tablet', 'unknown'],
      default: 'unknown'
    }
  },
  
  // Analytics and Tracking
  analytics: {
    impressions: {
      type: Number,
      default: 0
    },
    clicks: {
      type: Number,
      default: 0
    },
    clickThroughRate: {
      type: Number,
      default: 0
    },
    engagementScore: {
      type: Number,
      default: 0
    },
    lastInteraction: Date
  },
  
  // A/B Testing and Experiments
  experiment: {
    id: String,
    variant: String,
    group: String
  },
  
  // Notification Aggregation
  aggregation: {
    isAggregated: {
      type: Boolean,
      default: false
    },
    aggregatedCount: {
      type: Number,
      default: 1
    },
    aggregatedNotifications: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Notification'
    }],
    aggregationKey: String // For grouping similar notifications
  },
  
  // Rich Media and Attachments
  media: {
    icon: {
      url: String,
      emoji: String,
      color: String
    },
    images: [{
      url: String,
      alt: String,
      width: Number,
      height: Number
    }],
    videos: [{
      url: String,
      thumbnail: String,
      duration: Number
    }]
  },
  
  // Interactive Elements
  interactions: {
    buttons: [{
      text: String,
      action: String,
      url: String,
      style: {
        type: String,
        enum: ['primary', 'secondary', 'success', 'warning', 'danger'],
        default: 'primary'
      }
    }],
    quickActions: [{
      type: String,
      enum: ['like', 'save', 'share', 'follow', 'vote_up', 'vote_down'],
      performed: {
        type: Boolean,
        default: false
      },
      performedAt: Date
    }]
  },
  
  // Error Handling and Retry Logic
  errors: [{
    channel: {
      type: String,
      enum: ['inApp', 'email', 'push', 'sms']
    },
    error: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    retryCount: {
      type: Number,
      default: 0
    }
  }],
  
  retryAttempts: {
    type: Number,
    default: 0,
    max: 3
  },
  
  lastRetryAt: Date,
  
  // Compliance and Privacy
  compliance: {
    gdprConsent: {
      type: Boolean,
      default: false
    },
    optedOut: {
      type: Boolean,
      default: false
    },
    retentionPeriod: {
      type: Number,
      default: 90 // days
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ recipient: 1, type: 1 });
notificationSchema.index({ status: 1 });
notificationSchema.index({ scheduledFor: 1 });
notificationSchema.index({ expiresAt: 1 });
notificationSchema.index({ batchId: 1 });
notificationSchema.index({ 'aggregation.aggregationKey': 1 });

// TTL index for automatic cleanup
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual for time since creation
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

// Virtual for overall delivery status
notificationSchema.virtual('deliveryStatus').get(function() {
  const { delivery } = this;
  if (delivery.inApp.delivered || delivery.email.delivered || delivery.push.delivered || delivery.sms.delivered) {
    return 'delivered';
  }
  if (delivery.inApp.sent || delivery.email.sent || delivery.push.sent || delivery.sms.sent) {
    return 'sent';
  }
  return 'pending';
});

// Virtual for engagement rate
notificationSchema.virtual('engagementRate').get(function() {
  if (this.analytics.impressions === 0) return 0;
  return (this.analytics.clicks / this.analytics.impressions * 100).toFixed(2);
});

// Pre-save middleware
notificationSchema.pre('save', function(next) {
  // Set expiration if not set
  if (!this.expiresAt) {
    const expirationDays = this.compliance.retentionPeriod || 90;
    this.expiresAt = new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000);
  }
  
  // Set short message if not provided
  if (!this.shortMessage && this.message) {
    this.shortMessage = this.message.length > 100 
      ? this.message.substring(0, 97) + '...' 
      : this.message;
  }
  
  next();
});

// Method to mark as read
notificationSchema.methods.markAsRead = function() {
  if (!this.isRead) {
    this.isRead = true;
    this.readAt = new Date();
    this.status = 'read';
    this.analytics.lastInteraction = new Date();
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to mark as dismissed
notificationSchema.methods.dismiss = function() {
  this.isDismissed = true;
  this.dismissedAt = new Date();
  return this.save();
};

// Method to track click
notificationSchema.methods.trackClick = function() {
  this.analytics.clicks += 1;
  this.analytics.lastInteraction = new Date();
  if (this.status === 'read') {
    this.status = 'clicked';
  }
  this.analytics.clickThroughRate = this.analytics.impressions > 0 
    ? (this.analytics.clicks / this.analytics.impressions * 100) 
    : 0;
  return this.save();
};

// Method to track impression
notificationSchema.methods.trackImpression = function() {
  this.analytics.impressions += 1;
  this.analytics.clickThroughRate = this.analytics.impressions > 0 
    ? (this.analytics.clicks / this.analytics.impressions * 100) 
    : 0;
  return this.save();
};

// Method to update delivery status
notificationSchema.methods.updateDeliveryStatus = function(channel, status, timestamp = new Date()) {
  if (this.delivery[channel]) {
    this.delivery[channel][status] = true;
    this.delivery[channel][`${status}At`] = timestamp;
    
    if (status === 'delivered') {
      this.status = 'delivered';
    }
  }
  return this.save();
};

// Static method to get unread count for user
notificationSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({
    recipient: userId,
    isRead: false,
    isDismissed: false,
    status: { $ne: 'failed' }
  });
};

// Static method to get recent notifications for user
notificationSchema.statics.getRecentForUser = function(userId, limit = 20, offset = 0) {
  return this.find({
    recipient: userId,
    isDismissed: false,
    status: { $ne: 'failed' }
  })
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit)
    .populate('sender', 'username profile.avatar')
    .populate('relatedContent.question', 'title slug')
    .populate('relatedContent.user', 'username profile.avatar');
};

// Static method to mark all as read for user
notificationSchema.statics.markAllAsReadForUser = function(userId) {
  return this.updateMany(
    { recipient: userId, isRead: false },
    { 
      $set: { 
        isRead: true, 
        readAt: new Date(),
        status: 'read'
      }
    }
  );
};

// Static method to create notification
notificationSchema.statics.createNotification = function(data) {
  const notification = new this(data);
  
  // Set default values based on type
  const typeDefaults = {
    question_answered: { category: 'interaction', priority: 'normal' },
    answer_accepted: { category: 'achievement', priority: 'high' },
    mention: { category: 'social', priority: 'high' },
    system_announcement: { category: 'system', priority: 'normal' },
    badge_earned: { category: 'achievement', priority: 'normal' }
  };
  
  const defaults = typeDefaults[notification.type] || {};
  Object.assign(notification, defaults, data);
  
  return notification.save();
};

// Static method to aggregate similar notifications
notificationSchema.statics.aggregateNotifications = function(userId, type, timeWindow = 24) {
  const since = new Date(Date.now() - timeWindow * 60 * 60 * 1000);
  
  return this.aggregate([
    {
      $match: {
        recipient: userId,
        type: type,
        createdAt: { $gte: since },
        'aggregation.isAggregated': false
      }
    },
    {
      $group: {
        _id: '$aggregation.aggregationKey',
        notifications: { $push: '$$ROOT' },
        count: { $sum: 1 }
      }
    },
    {
      $match: { count: { $gt: 1 } }
    }
  ]);
};

export default mongoose.model('Notification', notificationSchema);
