import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  // Basic Comment Information
  body: {
    type: String,
    required: [true, 'Comment body is required'],
    trim: true,
    minlength: [1, 'Comment must not be empty'],
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  
  // Rich Content Support
  content: {
    html: String,
    markdown: String,
    mentions: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      username: String,
      position: {
        start: Number,
        end: Number
      }
    }],
    links: [{
      url: String,
      title: String,
      position: {
        start: Number,
        end: Number
      }
    }]
  },
  
  // Comment Author
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Comment Target (what is being commented on)
  target: {
    type: {
      type: String,
      enum: ['question', 'answer'],
      required: true
    },
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question'
    },
    answer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Answer'
    }
  },
  
  // Threading and Replies
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  },
  
  replies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  
  threadLevel: {
    type: Number,
    default: 0,
    max: 5 // Limit nesting depth
  },
  
  // Comment Status
  status: {
    type: String,
    enum: ['active', 'deleted', 'flagged', 'hidden', 'edited'],
    default: 'active'
  },
  
  visibility: {
    type: String,
    enum: ['public', 'author-only', 'moderator-only'],
    default: 'public'
  },
  
  // Voting System
  votes: {
    upvotes: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      votedAt: {
        type: Date,
        default: Date.now
      }
    }],
    downvotes: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      votedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  
  // Reactions System
  reactions: [{
    type: {
      type: String,
      enum: ['like', 'love', 'laugh', 'wow', 'sad', 'angry', 'thumbs_up', 'thumbs_down', 'heart', 'fire', 'clap'],
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Edit History and Version Control
  editHistory: [{
    editedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    editedAt: {
      type: Date,
      default: Date.now
    },
    previousContent: String,
    reason: String,
    changeType: {
      type: String,
      enum: ['typo', 'clarification', 'addition', 'correction', 'formatting']
    }
  }],
  
  isEdited: {
    type: Boolean,
    default: false
  },
  
  lastEditedAt: Date,
  
  // Moderation
  moderation: {
    flags: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      reason: {
        type: String,
        enum: ['spam', 'harassment', 'inappropriate', 'off-topic', 'misinformation', 'other']
      },
      description: String,
      flaggedAt: {
        type: Date,
        default: Date.now
      }
    }],
    reviewStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'requires-edit'],
      default: 'approved'
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: Date,
    reviewNotes: String,
    autoModerated: {
      type: Boolean,
      default: false
    },
    confidence: Number // AI moderation confidence score
  },
  
  // Analytics and Engagement
  analytics: {
    views: {
      type: Number,
      default: 0
    },
    uniqueViews: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      viewedAt: {
        type: Date,
        default: Date.now
      },
      ipAddress: String
    }],
    shares: {
      type: Number,
      default: 0
    },
    reports: {
      type: Number,
      default: 0
    }
  },
  
  // Quality Metrics
  quality: {
    helpfulnessScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    clarityScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    relevanceScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    sentimentScore: {
      type: Number,
      default: 0,
      min: -1,
      max: 1
    },
    toxicityScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 1
    }
  },
  
  // AI and ML Features
  aiAnalysis: {
    isGenerated: {
      type: Boolean,
      default: false
    },
    confidence: Number,
    suggestedImprovements: [String],
    topics: [String],
    entities: [{
      text: String,
      type: String,
      confidence: Number
    }],
    language: {
      type: String,
      default: 'en'
    },
    translatedVersions: [{
      language: String,
      content: String,
      confidence: Number
    }]
  },
  
  // Notifications and Alerts
  notifications: {
    mentionedUsers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    subscribedUsers: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      subscriptionType: {
        type: String,
        enum: ['all', 'replies', 'mentions'],
        default: 'replies'
      }
    }]
  },
  
  // Collaboration Features
  collaborativeEditing: {
    isEnabled: {
      type: Boolean,
      default: false
    },
    editors: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      permissions: [{
        type: String,
        enum: ['read', 'edit', 'delete', 'moderate']
      }],
      addedAt: {
        type: Date,
        default: Date.now
      }
    }],
    lastCollaborativeEdit: Date
  },
  
  // Attachments and Media
  attachments: [{
    type: {
      type: String,
      enum: ['image', 'gif', 'video', 'audio', 'document', 'link']
    },
    url: String,
    filename: String,
    size: Number,
    mimetype: String,
    description: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Contextual Information
  context: {
    deviceType: {
      type: String,
      enum: ['desktop', 'mobile', 'tablet']
    },
    browser: String,
    ipAddress: String,
    geolocation: {
      country: String,
      city: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    },
    referrer: String
  },
  
  // Timestamps and Scheduling
  publishedAt: {
    type: Date,
    default: Date.now
  },
  
  scheduledFor: Date,
  
  // SEO and Search
  searchableContent: String, // Processed content for search
  
  // Performance Tracking
  performance: {
    loadTime: Number,
    renderTime: Number,
    interactionTime: Number
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
commentSchema.index({ 'target.question': 1, createdAt: -1 });
commentSchema.index({ 'target.answer': 1, createdAt: -1 });
commentSchema.index({ author: 1, createdAt: -1 });
commentSchema.index({ parentComment: 1 });
commentSchema.index({ status: 1, visibility: 1 });
commentSchema.index({ body: 'text' });

// Virtual for vote score
commentSchema.virtual('voteScore').get(function() {
  const upvotes = this.votes.upvotes ? this.votes.upvotes.length : 0;
  const downvotes = this.votes.downvotes ? this.votes.downvotes.length : 0;
  return upvotes - downvotes;
});

// Virtual for reply count
commentSchema.virtual('replyCount').get(function() {
  return this.replies ? this.replies.length : 0;
});

// Virtual for reaction count
commentSchema.virtual('reactionCount').get(function() {
  return this.reactions ? this.reactions.length : 0;
});

// Virtual for time since last edit
commentSchema.virtual('timeSinceEdit').get(function() {
  if (!this.lastEditedAt) return null;
  return Date.now() - this.lastEditedAt.getTime();
});

// Virtual for overall quality score
commentSchema.virtual('overallQuality').get(function() {
  const { helpfulnessScore, clarityScore, relevanceScore } = this.quality;
  return ((helpfulnessScore + clarityScore + relevanceScore) / 3).toFixed(1);
});

// Pre-save middleware
commentSchema.pre('save', function(next) {
  // Update searchable content
  this.searchableContent = this.body
    .toLowerCase()
    .replace(/[^\w\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Set thread level based on parent
  if (this.parentComment && this.isNew) {
    Comment.findById(this.parentComment)
      .then(parent => {
        if (parent) {
          this.threadLevel = Math.min(parent.threadLevel + 1, 5);
        }
        next();
      })
      .catch(next);
  } else {
    next();
  }
});

// Method to check if user has voted
commentSchema.methods.hasUserVoted = function(userId) {
  const upvoted = this.votes.upvotes.some(vote => vote.user.toString() === userId.toString());
  const downvoted = this.votes.downvotes.some(vote => vote.user.toString() === userId.toString());
  
  if (upvoted) return 'upvote';
  if (downvoted) return 'downvote';
  return null;
};

// Method to add vote
commentSchema.methods.addVote = function(userId, voteType) {
  // Remove existing vote first
  this.votes.upvotes = this.votes.upvotes.filter(vote => vote.user.toString() !== userId.toString());
  this.votes.downvotes = this.votes.downvotes.filter(vote => vote.user.toString() !== userId.toString());
  
  // Add new vote
  if (voteType === 'upvote') {
    this.votes.upvotes.push({ user: userId });
  } else if (voteType === 'downvote') {
    this.votes.downvotes.push({ user: userId });
  }
  
  return this.save();
};

// Method to add reaction
commentSchema.methods.addReaction = function(userId, reactionType) {
  // Remove existing reaction from this user
  this.reactions = this.reactions.filter(reaction => reaction.user.toString() !== userId.toString());
  
  // Add new reaction
  this.reactions.push({ type: reactionType, user: userId });
  
  return this.save();
};

// Method to remove reaction
commentSchema.methods.removeReaction = function(userId) {
  this.reactions = this.reactions.filter(reaction => reaction.user.toString() !== userId.toString());
  return this.save();
};

// Method to edit comment
commentSchema.methods.editComment = function(newContent, editedBy, reason = '') {
  // Save edit history
  this.editHistory.push({
    editedBy,
    previousContent: this.body,
    reason,
    changeType: this.determineChangeType(this.body, newContent)
  });
  
  // Update content
  this.body = newContent;
  this.isEdited = true;
  this.lastEditedAt = new Date();
  this.status = 'edited';
  
  return this.save();
};

// Method to determine change type
commentSchema.methods.determineChangeType = function(oldContent, newContent) {
  const oldLength = oldContent.length;
  const newLength = newContent.length;
  const lengthDiff = Math.abs(newLength - oldLength);
  
  if (lengthDiff < 10) return 'typo';
  if (lengthDiff < 50) return 'clarification';
  if (newLength > oldLength) return 'addition';
  return 'correction';
};

// Method to flag comment
commentSchema.methods.flag = function(userId, reason, description = '') {
  this.moderation.flags.push({
    user: userId,
    reason,
    description
  });
  
  // Auto-hide if too many flags
  if (this.moderation.flags.length >= 3) {
    this.status = 'flagged';
    this.moderation.reviewStatus = 'pending';
  }
  
  return this.save();
};

// Static method to get comments for target
commentSchema.statics.getCommentsForTarget = function(targetType, targetId, options = {}) {
  const { 
    page = 1, 
    limit = 20, 
    sort = 'createdAt',
    order = 'asc',
    includeReplies = true 
  } = options;
  
  const query = {
    'target.type': targetType,
    [`target.${targetType}`]: targetId,
    status: 'active',
    visibility: 'public'
  };
  
  if (!includeReplies) {
    query.parentComment = { $exists: false };
  }
  
  return this.find(query)
    .sort({ [sort]: order === 'desc' ? -1 : 1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('author', 'username profile.avatar reputation.score')
    .populate('replies', null, null, { sort: { createdAt: 1 } });
};

// Static method to get trending comments
commentSchema.statics.getTrendingComments = function(timeframe = '24h', limit = 10) {
  const now = new Date();
  const since = new Date(now.getTime() - (parseInt(timeframe) * 60 * 60 * 1000));
  
  return this.aggregate([
    {
      $match: {
        status: 'active',
        visibility: 'public',
        createdAt: { $gte: since }
      }
    },
    {
      $addFields: {
        score: {
          $add: [
            { $multiply: [{ $size: '$votes.upvotes' }, 2] },
            { $multiply: [{ $size: '$reactions' }, 1] },
            { $multiply: [{ $size: '$replies' }, 1.5] }
          ]
        }
      }
    },
    { $sort: { score: -1 } },
    { $limit: limit }
  ]);
};

// Make sure to export the model
const Comment = mongoose.model('Comment', commentSchema);
export default Comment;
