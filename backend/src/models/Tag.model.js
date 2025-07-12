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
    maxlength: [30, 'Tag name cannot exceed 30 characters']
  }
}, {
  timestamps: true, // This provides createdAt automatically
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
tagSchema.index({ name: 1 });
tagSchema.index({ createdAt: -1 });

// Virtual for URL (if needed for routing)
tagSchema.virtual('url').get(function() {
  return `/tags/${this.name}`;
});

export default mongoose.model('Tag', tagSchema);
