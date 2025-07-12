import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema({
  // Basic Information
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
  },
  
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  
  // Profile Information
  profile: {
    firstName: {
      type: String,
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
      type: String,
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters']
    },
    avatar: {
      url: String,
      publicId: String
    },
    location: {
      type: String,
      maxlength: [100, 'Location cannot exceed 100 characters']
    },
    website: {
      type: String,
      match: [/^https?:\/\/.+/, 'Please provide a valid URL']
    },
    socialLinks: {
      github: String,
      linkedin: String,
      twitter: String
    }
  },
  
  // User Role & Status
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user'
  },
  
  status: {
    type: String,
    enum: ['active', 'suspended', 'banned', 'pending'],
    default: 'active'
  },
  
  // Reputation System
  reputation: {
    score: {
      type: Number,
      default: 0,
      min: 0
    },
    badges: [{
      name: String,
      icon: String,
      earnedAt: {
        type: Date,
        default: Date.now
      }
    }],
    achievements: [{
      type: String,
      unlockedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  
  // Activity Tracking
  activity: {
    questionsAsked: {
      type: Number,
      default: 0
    },
    answersGiven: {
      type: Number,
      default: 0
    },
    totalVotes: {
      upvotes: {
        type: Number,
        default: 0
      },
      downvotes: {
        type: Number,
        default: 0
      }
    },
    acceptedAnswers: {
      type: Number,
      default: 0
    },
    lastActive: {
      type: Date,
      default: Date.now
    }
  },
  
  // User Preferences
  preferences: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    pushNotifications: {
      type: Boolean,
      default: true
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    language: {
      type: String,
      default: 'en'
    },
    privacy: {
      showEmail: {
        type: Boolean,
        default: false
      },
      showActivity: {
        type: Boolean,
        default: true
      }
    }
  },
  
  // Security
  security: {
    twoFactorEnabled: {
      type: Boolean,
      default: false
    },
    twoFactorSecret: {
      type: String,
      select: false
    },
    loginAttempts: {
      type: Number,
      default: 0
    },
    lockUntil: Date,
    passwordResetToken: {
      type: String,
      select: false
    },
    passwordResetExpires: {
      type: Date,
      select: false
    },
    emailVerificationToken: {
      type: String,
      select: false
    },
    emailVerified: {
      type: Boolean,
      default: false
    }
  },
  
  // Following/Followers System
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Saved Content
  savedQuestions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }],
  
  // Tags User is Interested In
  interestedTags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag'
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ 'reputation.score': -1 });
userSchema.index({ 'activity.lastActive': -1 });
userSchema.index({ createdAt: -1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  if (this.profile.firstName && this.profile.lastName) {
    return `${this.profile.firstName} ${this.profile.lastName}`;
  }
  return this.username;
});

// Virtual for account lock status
userSchema.virtual('isLocked').get(function() {
  return !!(this.security.lockUntil && this.security.lockUntil > Date.now());
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate JWT token
userSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { 
      id: this._id,
      username: this.username,
      email: this.email,
      role: this.role
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Method to increment login attempts
userSchema.methods.incLoginAttempts = function() {
  if (this.security.lockUntil && this.security.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { 'security.lockUntil': 1, 'security.loginAttempts': 1 }
    });
  }
  
  const updates = { $inc: { 'security.loginAttempts': 1 } };
  
  if (this.security.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = {
      'security.lockUntil': Date.now() + 2 * 60 * 60 * 1000 // 2 hours
    };
  }
  
  return this.updateOne(updates);
};

// Method to update reputation
userSchema.methods.updateReputation = function(points, reason) {
  this.reputation.score = Math.max(0, this.reputation.score + points);
  
  // Add achievement logic here
  const milestones = [10, 50, 100, 500, 1000, 5000];
  const currentMilestone = milestones.find(m => 
    this.reputation.score >= m && 
    !this.reputation.achievements.includes(`reputation_${m}`)
  );
  
  if (currentMilestone) {
    this.reputation.achievements.push(`reputation_${currentMilestone}`);
  }
  
  return this.save();
};

// Static method to find by username or email
userSchema.statics.findByCredentials = async function(identifier) {
  const user = await this.findOne({
    $or: [
      { email: identifier.toLowerCase() },
      { username: identifier }
    ]
  }).select('+password');
  
  return user;
};

// Static method to get leaderboard
userSchema.statics.getLeaderboard = function(limit = 10) {
  return this.find({ status: 'active' })
    .sort({ 'reputation.score': -1 })
    .limit(limit)
    .select('username profile.avatar reputation activity');
};

export default mongoose.model('User', userSchema);
