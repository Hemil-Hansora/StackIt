import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema({
  // Answer Content (Rich Text)
  content: {
    type: mongoose.Schema.Types.Mixed, // Rich Text JSON or HTML
    required: [true, 'Answer content is required']
  },
  
  // Foreign Key References
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Acceptance Status (sync with Question.acceptedAnswerId)
  isAccepted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true, // This provides createdAt and updatedAt automatically
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance optimization
answerSchema.index({ questionId: 1, createdAt: -1 });
answerSchema.index({ userId: 1, createdAt: -1 });
answerSchema.index({ isAccepted: 1 });
answerSchema.index({ questionId: 1, isAccepted: 1 });

// Virtual for URL (if needed for routing)
answerSchema.virtual('url').get(function() {
  return `/questions/${this.questionId}/answers/${this._id}`;
});

export default mongoose.model('Answer', answerSchema);
