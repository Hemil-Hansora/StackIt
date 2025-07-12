import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema({
  body: {
    type: String,
    required: [true, 'Answer body is required'],
    minlength: [10, 'Answer must be at least 10 characters']
  },
  
  // Foreign Key References
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

  // Stats
  voteCount: {
    type: Number,
    default: 0
  },

  isAccepted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance optimization
answerSchema.index({ question: 1, createdAt: -1 });
answerSchema.index({ author: 1, createdAt: -1 });
answerSchema.index({ isAccepted: 1 });
answerSchema.index({ question: 1, isAccepted: 1 });

export const Answer = mongoose.model('Answer', answerSchema);
