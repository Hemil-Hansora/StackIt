import mongoose from 'mongoose';

const voteSchema = new mongoose.Schema({
  // Foreign Key References
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  answerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Answer',
    required: true
  },
  
  // Vote Value (-1 for downvote, +1 for upvote)
  value: {
    type: Number,
    enum: [-1, 1],
    required: true
  }
}, {
  timestamps: true, // This provides createdAt and updatedAt automatically
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound unique index to prevent duplicate votes from same user on same answer
voteSchema.index({ userId: 1, answerId: 1 }, { unique: true });

// Performance indexes
voteSchema.index({ answerId: 1, value: 1 });
voteSchema.index({ userId: 1, createdAt: -1 });

// Virtual for vote type
voteSchema.virtual('voteType').get(function() {
  return this.value === 1 ? 'upvote' : 'downvote';
});

export const Vote = mongoose.model('Vote', voteSchema);
