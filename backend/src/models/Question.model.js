import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  // Basic Question Information (matching your schema)
  title: {
    type: String,
    required: [true, 'Question title is required'],
    trim: true,
    minlength: [10, 'Title must be at least 10 characters'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  
  description: {
    type: mongoose.Schema.Types.Mixed, // Rich Text JSON or HTML depending on editor
    required: [true, 'Question description is required']
  },
  
  // User Reference (Foreign Key)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Accepted Answer Reference (nullable FK)
  acceptedAnswerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Answer',
    default: null
  }
}, {
  timestamps: true, // This provides createdAt and updatedAt automatically
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance optimization
questionSchema.index({ title: 'text', description: 'text' });
questionSchema.index({ userId: 1, createdAt: -1 });
questionSchema.index({ acceptedAnswerId: 1 });
questionSchema.index({ createdAt: -1 });

// Virtual for URL-friendly ID (if needed for routing)
questionSchema.virtual('url').get(function() {
  return `/questions/${this._id}`;
});

export default mongoose.model('Question', questionSchema);
