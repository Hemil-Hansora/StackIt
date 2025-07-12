import mongoose from 'mongoose';

const tagSchema = new mongoose.Schema({
  // Basic Tag Information
  name: {
    type: String,
    required: [true, 'Tag name is required'],
    unique: true,
    trim: true,
    lowercase: true,
    minlength: [2, 'Tag name must be at least 2 characters'],
    maxlength: [30, 'Tag name cannot exceed 30 characters'],
    match: [/^[a-z0-9\-\.]+$/, 'Tag name can only contain lowercase letters, numbers, hyphens, and dots']
  },
  
  displayName: {
    type: String,
    required: true,
    trim: true
  },
  
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  
  // Tag Description and Information
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  
  excerpt: {
    type: String,
    maxlength: [150, 'Excerpt cannot exceed 150 characters']
  },
  
  // Visual Customization
  color: {
    type: String,
    default: '#3B82F6',
    match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please provide a valid hex color']
  },
  
  backgroundColor: {
    type: String,
    default: '#EFF6FF'
  },
  
  icon: {
    name: String,
    url: String,
    emoji: String
  },
  
  // Tag Hierarchy and Relationships
  category: {
    type: String,
    enum: [
      'programming-language', 'framework', 'library', 'tool', 
      'concept', 'platform', 'database', 'methodology', 
      'career', 'general', 'other'
    ],
    default: 'general'
  },
  
  parentTag: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag'
  },
  
  childTags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag'
  }],
  
  relatedTags: [{
    tag: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tag'
    },
    strength: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.5
    }
  }],
  
  synonyms: [{
    type: String,
    lowercase: true
  }],
  
  // Tag Statistics and Metrics
  statistics: {
    questionCount: {
      type: Number,
      default: 0
    },
    answerCount: {
      type: Number,
      default: 0
    },
    totalVotes: {
      type: Number,
      default: 0
    },
    followerCount: {
      type: Number,
      default: 0
    },
    weeklyGrowth: {
      type: Number,
      default: 0
    },
    monthlyGrowth: {
      type: Number,
      default: 0
    }
  },
  
  // Tag Trending and Popularity
  trending: {
    score: {
      type: Number,
      default: 0
    },
    rank: {
      type: Number,
      default: 0
    },
    isHot: {
      type: Boolean,
      default: false
    },
    isPeaking: {
      type: Boolean,
      default: false
    },
    lastCalculated: {
      type: Date,
      default: Date.now
    }
  },
  
  // Tag Status and Moderation
  status: {
    type: String,
    enum: ['active', 'deprecated', 'merged', 'blacklisted', 'pending'],
    default: 'active'
  },
  
  visibility: {
    type: String,
    enum: ['public', 'private', 'restricted'],
    default: 'public'
  },
  
  // Tag Creation and Management
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  moderators: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    },
    permissions: [{
      type: String,
      enum: ['edit', 'moderate', 'merge', 'delete']
    }]
  }],
  
  // External Resources and Documentation
  resources: {
    officialWebsite: String,
    documentation: String,
    github: String,
    stackoverflow: String,
    tutorial: String,
    wikipedia: String
  },
  
  // Tag Guidelines and Rules
  guidelines: {
    whenToUse: String,
    whenNotToUse: String,
    commonMistakes: [String],
    bestPractices: [String]
  },
  
  // Version Information (for technology tags)
  version: {
    current: String,
    supportedVersions: [String],
    deprecatedVersions: [String],
    releaseDate: Date,
    endOfLife: Date
  },
  
  // Community Engagement
  followers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    followedAt: {
      type: Date,
      default: Date.now
    },
    notificationLevel: {
      type: String,
      enum: ['all', 'important', 'none'],
      default: 'important'
    }
  }],
  
  experts: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    expertiseLevel: {
      type: Number,
      min: 1,
      max: 10,
      default: 5
    },
    verifiedAt: Date,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  
  // SEO and Discovery
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String],
    canonicalUrl: String
  },
  
  // Analytics and Insights
  analytics: {
    dailyViews: [{
      date: Date,
      views: Number
    }],
    popularQuestions: [{
      question: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question'
      },
      score: Number
    }],
    topContributors: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      contributionScore: Number
    }]
  },
  
  // Machine Learning and AI
  ml: {
    embedding: [Number], // Vector embedding for similarity
    relatedConcepts: [String],
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'intermediate'
    },
    learningPath: [{
      step: Number,
      title: String,
      description: String,
      resources: [String]
    }]
  },
  
  // Internationalization
  i18n: {
    translations: [{
      language: String,
      name: String,
      description: String
    }],
    aliases: [String] // Different names in different regions
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
tagSchema.index({ name: 1 });
tagSchema.index({ displayName: 1 });
tagSchema.index({ slug: 1 });
tagSchema.index({ category: 1 });
tagSchema.index({ 'statistics.questionCount': -1 });
tagSchema.index({ 'trending.score': -1 });
tagSchema.index({ status: 1, visibility: 1 });
tagSchema.index({ createdAt: -1 });

// Text search index
tagSchema.index({
  name: 'text',
  displayName: 'text',
  description: 'text',
  synonyms: 'text'
});

// Virtual for full URL
tagSchema.virtual('url').get(function() {
  return `/tags/${this.slug || this.name}`;
});

// Virtual for popularity level
tagSchema.virtual('popularityLevel').get(function() {
  const count = this.statistics.questionCount;
  if (count > 1000) return 'very-popular';
  if (count > 100) return 'popular';
  if (count > 10) return 'moderate';
  return 'new';
});

// Virtual for activity level
tagSchema.virtual('activityLevel').get(function() {
  const growth = this.statistics.weeklyGrowth;
  if (growth > 50) return 'very-active';
  if (growth > 10) return 'active';
  if (growth > 0) return 'moderate';
  return 'inactive';
});

// Pre-save middleware to generate slug
tagSchema.pre('save', function(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\-\.]/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }
  
  if (this.isModified('name') && !this.displayName) {
    this.displayName = this.name.charAt(0).toUpperCase() + this.name.slice(1);
  }
  
  next();
});

// Method to increment question count
tagSchema.methods.incrementQuestionCount = function() {
  this.statistics.questionCount += 1;
  this.updateTrendingScore();
  return this.save();
};

// Method to decrement question count
tagSchema.methods.decrementQuestionCount = function() {
  this.statistics.questionCount = Math.max(0, this.statistics.questionCount - 1);
  this.updateTrendingScore();
  return this.save();
};

// Method to update trending score
tagSchema.methods.updateTrendingScore = function() {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  // Calculate trending score based on recent activity
  const recentActivity = this.statistics.weeklyGrowth || 0;
  const totalQuestions = this.statistics.questionCount || 0;
  const followerCount = this.statistics.followerCount || 0;
  
  this.trending.score = (recentActivity * 0.5) + (Math.log(totalQuestions + 1) * 0.3) + (followerCount * 0.2);
  this.trending.lastCalculated = now;
  
  // Determine if tag is hot or peaking
  this.trending.isHot = recentActivity > 20 && this.trending.score > 10;
  this.trending.isPeaking = recentActivity > this.statistics.monthlyGrowth;
};

// Method to add follower
tagSchema.methods.addFollower = function(userId, notificationLevel = 'important') {
  if (!this.followers.some(follower => follower.user.toString() === userId.toString())) {
    this.followers.push({ user: userId, notificationLevel });
    this.statistics.followerCount += 1;
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to remove follower
tagSchema.methods.removeFollower = function(userId) {
  const initialLength = this.followers.length;
  this.followers = this.followers.filter(follower => follower.user.toString() !== userId.toString());
  
  if (this.followers.length < initialLength) {
    this.statistics.followerCount = Math.max(0, this.statistics.followerCount - 1);
    return this.save();
  }
  return Promise.resolve(this);
};

// Static method to get trending tags
tagSchema.statics.getTrending = function(limit = 20) {
  return this.find({ 
    status: 'active', 
    visibility: 'public' 
  })
    .sort({ 'trending.score': -1 })
    .limit(limit)
    .select('name displayName color trending statistics');
};

// Static method to get popular tags
tagSchema.statics.getPopular = function(limit = 50) {
  return this.find({ 
    status: 'active', 
    visibility: 'public' 
  })
    .sort({ 'statistics.questionCount': -1 })
    .limit(limit)
    .select('name displayName color statistics');
};

// Static method to search tags
tagSchema.statics.searchTags = function(query, limit = 10) {
  return this.find({
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { displayName: { $regex: query, $options: 'i' } },
      { synonyms: { $in: [new RegExp(query, 'i')] } }
    ],
    status: 'active',
    visibility: 'public'
  })
    .sort({ 'statistics.questionCount': -1 })
    .limit(limit)
    .select('name displayName color statistics');
};

// Static method to get related tags
tagSchema.statics.getRelatedTags = function(tagIds, limit = 10) {
  return this.aggregate([
    { $match: { _id: { $in: tagIds } } },
    { $unwind: '$relatedTags' },
    { $sort: { 'relatedTags.strength': -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'tags',
        localField: 'relatedTags.tag',
        foreignField: '_id',
        as: 'tagInfo'
      }
    },
    { $unwind: '$tagInfo' },
    {
      $project: {
        name: '$tagInfo.name',
        displayName: '$tagInfo.displayName',
        color: '$tagInfo.color',
        strength: '$relatedTags.strength',
        statistics: '$tagInfo.statistics'
      }
    }
  ]);
};

// Static method to update all trending scores
tagSchema.statics.updateAllTrendingScores = function() {
  return this.find({ status: 'active' }).then(tags => {
    return Promise.all(tags.map(tag => {
      tag.updateTrendingScore();
      return tag.save();
    }));
  });
};

export default mongoose.model('Tag', tagSchema);
