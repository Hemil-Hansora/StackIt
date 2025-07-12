import mongoose from 'mongoose';

const voteSchema = new mongoose.Schema({
  // Vote Information
  voteType: {
    type: String,
    enum: ['upvote', 'downvote'],
    required: true
  },
  
  value: {
    type: Number,
    enum: [1, -1],
    required: true
  },
  
  // Voter Information
  voter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Target of the Vote
  target: {
    type: {
      type: String,
      enum: ['question', 'answer', 'comment'],
      required: true
    },
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
    }
  },
  
  // Content Author (for reputation tracking)
  contentAuthor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Vote Context and Analytics
  context: {
    deviceType: {
      type: String,
      enum: ['desktop', 'mobile', 'tablet', 'unknown'],
      default: 'unknown'
    },
    browser: String,
    ipAddress: String,
    userAgent: String,
    referrer: String,
    sessionId: String
  },
  
  // Vote Timing and Behavior
  timing: {
    timeToVote: Number, // Time spent on content before voting (in seconds)
    scrollPosition: Number, // How far user scrolled before voting
    readTime: Number, // Estimated time user spent reading
    interactionsBefore: Number, // Number of interactions before voting
    isQuickVote: {
      type: Boolean,
      default: false
    }
  },
  
  // Vote Quality and Confidence
  quality: {
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.5
    },
    isInformed: {
      type: Boolean,
      default: false
    },
    reasoning: String, // Optional reasoning for the vote
    tags: [String], // Tags that influenced the vote
    aiPredicted: {
      type: Boolean,
      default: false
    },
    predictionConfidence: Number
  },
  
  // Vote Status and Moderation
  status: {
    type: String,
    enum: ['active', 'revoked', 'flagged', 'suspicious', 'verified'],
    default: 'active'
  },
  
  isReversed: {
    type: Boolean,
    default: false
  },
  
  reversedAt: Date,
  
  reversalReason: String,
  
  // Fraud Detection
  fraudDetection: {
    isBot: {
      type: Boolean,
      default: false
    },
    isSockpuppet: {
      type: Boolean,
      default: false
    },
    riskScore: {
      type: Number,
      min: 0,
      max: 1,
      default: 0
    },
    anomalyScore: {
      type: Number,
      min: 0,
      max: 1,
      default: 0
    },
    patterns: [String],
    verificationMethod: String
  },
  
  // Vote Impact and Influence
  impact: {
    reputationChange: {
      voter: Number,
      author: Number
    },
    influenceScore: {
      type: Number,
      default: 0
    },
    cascadeVotes: Number, // Votes that followed this one
    controversyScore: Number, // How controversial this vote was
    weight: {
      type: Number,
      default: 1.0,
      min: 0,
      max: 10
    }
  },
  
  // Social Influence
  social: {
    followingAuthor: {
      type: Boolean,
      default: false
    },
    sharedConnections: Number,
    similarInterests: [String],
    previousInteractions: Number,
    trustScore: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.5
    }
  },
  
  // Temporal Patterns
  temporal: {
    timeOfDay: Number, // Hour of day (0-23)
    dayOfWeek: Number, // Day of week (0-6)
    timezone: String,
    isWeekend: Boolean,
    isHoliday: Boolean,
    seasonality: String
  },
  
  // Content Analysis at Vote Time
  contentSnapshot: {
    contentLength: Number,
    contentAge: Number, // Age of content when voted
    existingVoteCount: Number,
    existingScore: Number,
    answerCount: Number, // For questions
    acceptedAnswer: Boolean, // If question had accepted answer
    tags: [String],
    difficulty: String
  },
  
  // A/B Testing and Experiments
  experiments: [{
    experimentId: String,
    variant: String,
    group: String,
    startDate: Date,
    endDate: Date
  }],
  
  // Personalization Data
  personalization: {
    userExpertise: [String],
    userInterests: [String],
    userBehaviorPattern: String,
    recommendationSource: String,
    personalizedWeight: Number
  },
  
  // Audit Trail
  auditTrail: [{
    action: {
      type: String,
      enum: ['created', 'modified', 'revoked', 'flagged', 'verified']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String,
    metadata: mongoose.Schema.Types.Mixed
  }],
  
  // Machine Learning Features
  ml: {
    features: mongoose.Schema.Types.Mixed, // Feature vector for ML models
    modelVersion: String,
    predictionScore: Number,
    clusterAssignment: String,
    anomalyDetection: {
      isAnomaly: Boolean,
      score: Number,
      reasons: [String]
    }
  },
  
  // Performance Metrics
  performance: {
    processingTime: Number,
    validationTime: Number,
    indexingTime: Number,
    aggregationImpact: Number
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for performance and uniqueness
voteSchema.index({ voter: 1, 'target.type': 1, 'target.question': 1 }, { unique: true, sparse: true });
voteSchema.index({ voter: 1, 'target.type': 1, 'target.answer': 1 }, { unique: true, sparse: true });
voteSchema.index({ voter: 1, 'target.type': 1, 'target.comment': 1 }, { unique: true, sparse: true });

// Performance indexes
voteSchema.index({ contentAuthor: 1, createdAt: -1 });
voteSchema.index({ 'target.question': 1, voteType: 1 });
voteSchema.index({ 'target.answer': 1, voteType: 1 });
voteSchema.index({ status: 1 });
voteSchema.index({ createdAt: -1 });
voteSchema.index({ 'fraudDetection.riskScore': -1 });

// Analytics indexes
voteSchema.index({ 'temporal.timeOfDay': 1, 'temporal.dayOfWeek': 1 });
voteSchema.index({ 'impact.weight': -1 });
voteSchema.index({ 'quality.confidence': -1 });

// Virtual for target reference
voteSchema.virtual('targetRef').get(function() {
  const targetType = this.target.type;
  return this.target[targetType];
});

// Virtual for vote age
voteSchema.virtual('age').get(function() {
  return Date.now() - this.createdAt.getTime();
});

// Virtual for is recent
voteSchema.virtual('isRecent').get(function() {
  const hourAgo = Date.now() - (60 * 60 * 1000);
  return this.createdAt.getTime() > hourAgo;
});

// Virtual for effective weight
voteSchema.virtual('effectiveWeight').get(function() {
  let weight = this.impact.weight || 1.0;
  
  // Reduce weight for suspicious votes
  if (this.fraudDetection.riskScore > 0.7) {
    weight *= 0.1;
  } else if (this.fraudDetection.riskScore > 0.5) {
    weight *= 0.5;
  }
  
  // Reduce weight for low confidence votes
  if (this.quality.confidence < 0.3) {
    weight *= 0.7;
  }
  
  return weight;
});

// Pre-save middleware
voteSchema.pre('save', function(next) {
  // Set value based on vote type
  if (this.isNew) {
    this.value = this.voteType === 'upvote' ? 1 : -1;
    
    // Set temporal data
    const now = new Date();
    this.temporal.timeOfDay = now.getHours();
    this.temporal.dayOfWeek = now.getDay();
    this.temporal.isWeekend = now.getDay() === 0 || now.getDay() === 6;
    
    // Determine if it's a quick vote
    this.timing.isQuickVote = (this.timing.timeToVote || 0) < 10;
    
    // Add audit trail entry
    this.auditTrail.push({
      action: 'created',
      actor: this.voter,
      metadata: {
        voteType: this.voteType,
        targetType: this.target.type
      }
    });
  }
  
  next();
});

// Method to reverse vote
voteSchema.methods.reverse = function(reason = '') {
  this.isReversed = true;
  this.reversedAt = new Date();
  this.reversalReason = reason;
  this.status = 'revoked';
  
  // Add audit trail
  this.auditTrail.push({
    action: 'revoked',
    actor: this.voter,
    reason: reason
  });
  
  return this.save();
};

// Method to flag vote as suspicious
voteSchema.methods.flagAsSuspicious = function(reason, flaggedBy) {
  this.status = 'suspicious';
  this.fraudDetection.riskScore = Math.min(this.fraudDetection.riskScore + 0.3, 1.0);
  
  this.auditTrail.push({
    action: 'flagged',
    actor: flaggedBy,
    reason: reason
  });
  
  return this.save();
};

// Method to verify vote
voteSchema.methods.verify = function(verifiedBy, method = 'manual') {
  this.status = 'verified';
  this.fraudDetection.verificationMethod = method;
  this.fraudDetection.riskScore = Math.max(this.fraudDetection.riskScore - 0.5, 0);
  
  this.auditTrail.push({
    action: 'verified',
    actor: verifiedBy,
    metadata: { method }
  });
  
  return this.save();
};

// Method to calculate influence score
voteSchema.methods.calculateInfluenceScore = function() {
  let score = 1.0;
  
  // Factor in voter's reputation and expertise
  // Factor in vote timing and context
  // Factor in content quality and relevance
  
  this.impact.influenceScore = score;
  return this.save();
};

// Static method to get vote statistics for content
voteSchema.statics.getVoteStats = function(targetType, targetId) {
  const matchQuery = {
    'target.type': targetType,
    status: 'active'
  };
  matchQuery[`target.${targetType}`] = targetId;
  
  return this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: null,
        totalVotes: { $sum: 1 },
        upvotes: { $sum: { $cond: [{ $eq: ['$voteType', 'upvote'] }, 1, 0] } },
        downvotes: { $sum: { $cond: [{ $eq: ['$voteType', 'downvote'] }, 1, 0] } },
        score: { $sum: '$value' },
        weightedScore: { $sum: { $multiply: ['$value', '$impact.weight'] } },
        avgConfidence: { $avg: '$quality.confidence' },
        suspiciousVotes: { $sum: { $cond: [{ $eq: ['$status', 'suspicious'] }, 1, 0] } }
      }
    }
  ]);
};

// Static method to detect voting patterns
voteSchema.statics.detectVotingPatterns = function(userId, timeframe = '24h') {
  const now = new Date();
  const since = new Date(now.getTime() - (parseInt(timeframe) * 60 * 60 * 1000));
  
  return this.aggregate([
    {
      $match: {
        voter: userId,
        createdAt: { $gte: since }
      }
    },
    {
      $group: {
        _id: {
          hour: { $hour: '$createdAt' },
          voteType: '$voteType'
        },
        count: { $sum: 1 },
        avgTimeToVote: { $avg: '$timing.timeToVote' },
        quickVotes: { $sum: { $cond: ['$timing.isQuickVote', 1, 0] } }
      }
    },
    { $sort: { '_id.hour': 1 } }
  ]);
};

// Static method to get controversial content
voteSchema.statics.getControversialContent = function(targetType, limit = 10) {
  const matchQuery = {
    'target.type': targetType,
    status: 'active'
  };
  
  return this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: `$target.${targetType}`,
        upvotes: { $sum: { $cond: [{ $eq: ['$voteType', 'upvote'] }, 1, 0] } },
        downvotes: { $sum: { $cond: [{ $eq: ['$voteType', 'downvote'] }, 1, 0] } },
        totalVotes: { $sum: 1 }
      }
    },
    {
      $addFields: {
        controversyScore: {
          $cond: [
            { $eq: ['$totalVotes', 0] },
            0,
            { $divide: [{ $min: ['$upvotes', '$downvotes'] }, '$totalVotes'] }
          ]
        }
      }
    },
    { $match: { controversyScore: { $gt: 0.3 } } },
    { $sort: { controversyScore: -1 } },
    { $limit: limit }
  ]);
};

// Static method to analyze voting trends
voteSchema.statics.getVotingTrends = function(period = '7d') {
  const now = new Date();
  const since = new Date(now.getTime() - (parseInt(period) * 24 * 60 * 60 * 1000));
  
  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: since },
        status: 'active'
      }
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          type: '$voteType'
        },
        count: { $sum: 1 },
        avgWeight: { $avg: '$impact.weight' },
        avgConfidence: { $avg: '$quality.confidence' }
      }
    },
    { $sort: { '_id.date': 1 } }
  ]);
};

export default mongoose.model('Vote', voteSchema);
