import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  // Comment Content
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    trim: true,
    minlength: [1, 'Comment must not be empty'],
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  
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
  }
}, {
  timestamps: true, // This provides createdAt and updatedAt automatically
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
commentSchema.index({ answerId: 1, createdAt: -1 });
commentSchema.index({ userId: 1, createdAt: -1 });

// Virtual for URL (if needed for routing)
commentSchema.virtual('url').get(function() {
  return `/answers/${this.answerId}/comments/${this._id}`;
});

export default mongoose.model('Comment', commentSchema);
