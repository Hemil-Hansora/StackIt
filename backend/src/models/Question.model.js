import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  // Basic Question Information
  title: {
    type: String,
    required: [true, 'Question title is required'],
    trim: true,
    minlength: [10, 'Title must be at least 10 characters'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  
  body: {
    type: String,
    required: [true, 'Question body is required'],
    minlength: [20, 'Question body must be at least 20 characters']
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
  
  // Author Information
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Categorization
  tags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag',
    required: true
  }],
  
  category: {
    type: String,
    enum: ['general', 'technical', 'career', 'tutorial', 'discussion'],
    default: 'general'
  },
  
  // Question Status
  status: {
    type: String,
    enum: ['draft', 'published', 'closed', 'deleted', 'flagged'],
    default: 'published'
  },
  
  visibility: {
    type: String,
    enum: ['public', 'private', 'unlisted'],
    default: 'public'
  },
  
  // Interaction Metrics
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
  
  // Answer Management
  answers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Answer'
  }],
  
  acceptedAnswer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Answer'
  },
  
  // Engagement Metrics
  views: {
    count: {
      type: Number,
      default: 0
    },
    uniqueViewers: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      viewedAt: {
        type: Date,
        default: Date.now
      },
      ipAddress: String
    }]
  },
  
  favorites: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    favoritedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Comments and Discussion
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
    publicId: String, // For cloud storage
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // SEO and Metadata
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String],
    canonicalUrl: String
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
        enum: ['spam', 'inappropriate', 'duplicate', 'off-topic', 'other']
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
  
  // Advanced Features
  bounty: {
    amount: {
      type: Number,
      default: 0
    },
    expires: Date,
    isActive: {
      type: Boolean,
      default: false
    }
  },
  
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    default: 'beginner'
  },
  
  // Analytics
  analytics: {
    searchKeywords: [String],
    referralSources: [String],
    deviceTypes: [String],
    geolocation: [{
      country: String,
      city: String,
      count: Number
    }]
  },
  
  // Collaboration
  collaborators: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    permission: {
      type: String,
      enum: ['edit', 'comment', 'view'],
      default: 'view'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Version Control
  editHistory: [{
    editedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    editedAt: {
      type: Date,
      default: Date.now
    },
    changes: {
      title: {
        from: String,
        to: String
      },
      body: {
        from: String,
        to: String
      },
      tags: {
        added: [String],
        removed: [String]
      }
    },
    reason: String
  }],
  
  // Scheduling
  publishedAt: {
    type: Date,
    default: Date.now
  },
  
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance optimization
questionSchema.index({ title: 'text', body: 'text' });
questionSchema.index({ author: 1, createdAt: -1 });
questionSchema.index({ tags: 1 });
questionSchema.index({ status: 1, visibility: 1 });
questionSchema.index({ 'votes.upvotes': -1 });
questionSchema.index({ 'views.count': -1 });
questionSchema.index({ publishedAt: -1 });
questionSchema.index({ lastActivity: -1 });
questionSchema.index({ slug: 1 });

// Virtual for vote score
questionSchema.virtual('voteScore').get(function() {
  const upvotes = this.votes.upvotes ? this.votes.upvotes.length : 0;
  const downvotes = this.votes.downvotes ? this.votes.downvotes.length : 0;
  return upvotes - downvotes;
});

// Virtual for answer count
questionSchema.virtual('answerCount').get(function() {
  return this.answers ? this.answers.length : 0;
});

// Virtual for favorite count
questionSchema.virtual('favoriteCount').get(function() {
  return this.favorites ? this.favorites.length : 0;
});

// Virtual for reading time estimation
questionSchema.virtual('readingTime').get(function() {
  const wordsPerMinute = 200;
  const wordCount = this.body.split(' ').length;
  return Math.ceil(wordCount / wordsPerMinute);
});

// Virtual for URL-friendly slug
questionSchema.virtual('url').get(function() {
  return `/questions/${this.slug || this._id}`;
});

// Pre-save middleware to generate slug
questionSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-') + '-' + Date.now();
  }
  next();
});

// Pre-save middleware to update lastActivity
questionSchema.pre('save', function(next) {
  if (this.isModified('body') || this.isModified('title')) {
    this.lastActivity = new Date();
  }
  next();
});

// Method to check if user has voted
questionSchema.methods.hasUserVoted = function(userId) {
  const upvoted = this.votes.upvotes.some(vote => vote.user.toString() === userId.toString());
  const downvoted = this.votes.downvotes.some(vote => vote.user.toString() === userId.toString());
  
  if (upvoted) return 'upvote';
  if (downvoted) return 'downvote';
  return null;
};

// Method to add vote
questionSchema.methods.addVote = function(userId, voteType) {
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

// Method to increment view count
questionSchema.methods.incrementViews = function(userId, ipAddress) {
  this.views.count += 1;
  
  // Track unique viewers
  if (userId && !this.views.uniqueViewers.some(viewer => viewer.user.toString() === userId.toString())) {
    this.views.uniqueViewers.push({ user: userId, ipAddress });
  } else if (!userId && !this.views.uniqueViewers.some(viewer => viewer.ipAddress === ipAddress)) {
    this.views.uniqueViewers.push({ ipAddress });
  }
  
  return this.save();
};

// Static method to get trending questions
questionSchema.statics.getTrending = function(timeframe = '7d') {
  const now = new Date();
  const since = new Date(now.getTime() - (parseInt(timeframe) * 24 * 60 * 60 * 1000));
  
  return this.aggregate([
    {
      $match: {
        status: 'published',
        visibility: 'public',
        createdAt: { $gte: since }
      }
    },
    {
      $addFields: {
        score: {
          $add: [
            { $multiply: [{ $size: '$votes.upvotes' }, 3] },
            { $multiply: [{ $size: '$answers' }, 2] },
            { $multiply: ['$views.count', 0.1] }
          ]
        }
      }
    },
    { $sort: { score: -1 } },
    { $limit: 20 }
  ]);
};

// Static method to search questions
questionSchema.statics.search = function(query, filters = {}) {
  const searchQuery = {
    $text: { $search: query },
    status: 'published',
    visibility: 'public',
    ...filters
  };
  
  return this.find(searchQuery)
    .sort({ score: { $meta: 'textScore' }, lastActivity: -1 })
    .populate('author', 'username profile.avatar reputation.score')
    .populate('tags', 'name color');
};

export default mongoose.model('Question', questionSchema);
