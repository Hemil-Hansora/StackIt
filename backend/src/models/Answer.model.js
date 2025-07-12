import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema({
  // Basic Answer Information
  body: {
    type: String,
    required: [true, 'Answer body is required'],
    minlength: [10, 'Answer must be at least 10 characters']
  },
  
  // Rich Content Support
  content: {
    html: String, // Rendered HTML content
    markdown: String, // Original markdown if used
    blocks: [{ // For block-based editors
      type: String,
      data: mongoose.Schema.Types.Mixed
    }]
  },
  
  // Answer Relationships
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Parent Answer for Threading
  parentAnswer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Answer'
  },
  
  // Child Answers (Replies)
  replies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Answer'
  }],
  
  // Answer Status and Acceptance
  isAccepted: {
    type: Boolean,
    default: false
  },
  
  acceptedAt: Date,
  
  acceptedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  status: {
    type: String,
    enum: ['draft', 'published', 'deleted', 'flagged', 'hidden'],
    default: 'published'
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
  
  // Comments on Answer
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  
  // Media Attachments
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    url: String,
    publicId: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Code Snippets with Syntax Highlighting
  codeBlocks: [{
    language: String,
    code: String,
    title: String,
    lineNumbers: {
      type: Boolean,
      default: true
    }
  }],
  
  // Answer Quality Metrics
  quality: {
    helpfulnessScore: {
      type: Number,
      default: 0
    },
    clarityScore: {
      type: Number,
      default: 0
    },
    completenessScore: {
      type: Number,
      default: 0
    },
    aiGenerated: {
      type: Boolean,
      default: false
    },
    verified: {
      type: Boolean,
      default: false
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  
  // Moderation
  moderation: {
    flags: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      reason: {
        type: String,
        enum: ['spam', 'inappropriate', 'plagiarism', 'off-topic', 'low-quality', 'other']
      },
      description: String,
      flaggedAt: {
        type: Date,
        default: Date.now
      }
    }],
    reviewStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'approved'
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: Date,
    reviewNotes: String
  },
  
  // Version Control and Edit History
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
    changes: {
      type: String,
      enum: ['minor', 'major', 'correction', 'improvement']
    }
  }],
  
  // Collaborative Features
  collaborators: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    permission: {
      type: String,
      enum: ['edit', 'comment'],
      default: 'comment'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
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
    bookmarks: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      bookmarkedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  
  // AI-Assisted Features
  aiAssistance: {
    grammarChecked: {
      type: Boolean,
      default: false
    },
    factChecked: {
      type: Boolean,
      default: false
    },
    codeValidated: {
      type: Boolean,
      default: false
    },
    suggestions: [{
      type: String,
      confidence: Number,
      appliedAt: Date
    }]
  },
  
  // External References
  references: [{
    title: String,
    url: String,
    type: {
      type: String,
      enum: ['documentation', 'tutorial', 'article', 'video', 'book', 'other']
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Community Features
  endorsements: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    skill: String, // The skill this answer demonstrates
    endorsedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Performance Metrics
  performance: {
    loadTime: Number,
    renderTime: Number,
    codeExecutionTime: Number
  },
  
  // Notification Settings
  notifications: {
    authorNotified: {
      type: Boolean,
      default: false
    },
    followersNotified: {
      type: Boolean,
      default: false
    },
    mentionedUsers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
answerSchema.index({ question: 1, createdAt: -1 });
answerSchema.index({ author: 1, createdAt: -1 });
answerSchema.index({ isAccepted: 1 });
answerSchema.index({ 'votes.upvotes': -1 });
answerSchema.index({ status: 1 });
answerSchema.index({ body: 'text' });

// Virtual for vote score
answerSchema.virtual('voteScore').get(function() {
  const upvotes = this.votes.upvotes ? this.votes.upvotes.length : 0;
  const downvotes = this.votes.downvotes ? this.votes.downvotes.length : 0;
  return upvotes - downvotes;
});

// Virtual for reply count
answerSchema.virtual('replyCount').get(function() {
  return this.replies ? this.replies.length : 0;
});

// Virtual for bookmark count
answerSchema.virtual('bookmarkCount').get(function() {
  return this.analytics.bookmarks ? this.analytics.bookmarks.length : 0;
});

// Virtual for reading time
answerSchema.virtual('readingTime').get(function() {
  const wordsPerMinute = 200;
  const wordCount = this.body.split(' ').length;
  return Math.ceil(wordCount / wordsPerMinute);
});

// Virtual for overall quality score
answerSchema.virtual('qualityScore').get(function() {
  const { helpfulnessScore, clarityScore, completenessScore } = this.quality;
  return ((helpfulnessScore + clarityScore + completenessScore) / 3).toFixed(1);
});

// Pre-save middleware
answerSchema.pre('save', function(next) {
  // Update notification flags
  if (this.isNew) {
    this.notifications.authorNotified = false;
    this.notifications.followersNotified = false;
  }
  next();
});

// Method to check if user has voted
answerSchema.methods.hasUserVoted = function(userId) {
  const upvoted = this.votes.upvotes.some(vote => vote.user.toString() === userId.toString());
  const downvoted = this.votes.downvotes.some(vote => vote.user.toString() === userId.toString());
  
  if (upvoted) return 'upvote';
  if (downvoted) return 'downvote';
  return null;
};

// Method to add vote
answerSchema.methods.addVote = function(userId, voteType) {
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

// Method to accept answer
answerSchema.methods.acceptAnswer = function(acceptedBy) {
  this.isAccepted = true;
  this.acceptedAt = new Date();
  this.acceptedBy = acceptedBy;
  return this.save();
};

// Method to add bookmark
answerSchema.methods.addBookmark = function(userId) {
  if (!this.analytics.bookmarks.some(bookmark => bookmark.user.toString() === userId.toString())) {
    this.analytics.bookmarks.push({ user: userId });
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to remove bookmark
answerSchema.methods.removeBookmark = function(userId) {
  this.analytics.bookmarks = this.analytics.bookmarks.filter(
    bookmark => bookmark.user.toString() !== userId.toString()
  );
  return this.save();
};

// Static method to get top answers
answerSchema.statics.getTopAnswers = function(limit = 10, timeframe = '30d') {
  const now = new Date();
  const since = new Date(now.getTime() - (parseInt(timeframe) * 24 * 60 * 60 * 1000));
  
  return this.aggregate([
    {
      $match: {
        status: 'published',
        createdAt: { $gte: since }
      }
    },
    {
      $addFields: {
        score: {
          $add: [
            { $multiply: [{ $size: '$votes.upvotes' }, 5] },
            { $multiply: [{ $cond: ['$isAccepted', 10, 0] }, 1] },
            { $multiply: ['$analytics.views', 0.1] }
          ]
        }
      }
    },
    { $sort: { score: -1 } },
    { $limit: limit }
  ]);
};

// Static method to get user's best answers
answerSchema.statics.getUserBestAnswers = function(userId, limit = 5) {
  return this.find({ 
    author: userId, 
    status: 'published' 
  })
    .sort({ 'votes.upvotes': -1, isAccepted: -1 })
    .limit(limit)
    .populate('question', 'title slug');
};

export default mongoose.model('Answer', answerSchema);
