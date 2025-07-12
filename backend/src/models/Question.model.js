import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Question title is required'],
    trim: true,
    minlength: [10, 'Title must be at least 10 characters'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  
  body: {
    type: String,
    required: [true, 'Question body is required'],
    minlength: [20, 'Question body must be at least 20 characters']
  },
  
  // User Reference (Foreign Key)
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Tags array
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  
  // Accepted Answer Reference (nullable FK)
  acceptedAnswer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Answer',
    default: null
  },

  // Stats
  viewCount: {
    type: Number,
    default: 0
  },

  voteCount: {
    type: Number,
    default: 0
  },

  answerCount: {
    type: Number,
    default: 0
  },

  score: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance optimization
questionSchema.index({ title: 'text', body: 'text' });
questionSchema.index({ author: 1, createdAt: -1 });
questionSchema.index({ acceptedAnswer: 1 });
questionSchema.index({ createdAt: -1 });
questionSchema.index({ tags: 1 });
questionSchema.index({ voteCount: -1 });

// Virtual to get answers
questionSchema.virtual('answers', {
  ref: 'Answer',
  localField: '_id',
  foreignField: 'question'
});

export const Question = mongoose.model('Question', questionSchema);
