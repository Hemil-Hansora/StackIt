import mongoose from 'mongoose';

const questionTagSchema = new mongoose.Schema({
  // Foreign Key References for Many-to-Many relationship
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  
  tagId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag',
    required: true
  }
}, {
  timestamps: true, // This provides createdAt and updatedAt automatically
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound unique index to prevent duplicate question-tag relationships
questionTagSchema.index({ questionId: 1, tagId: 1 }, { unique: true });

// Performance indexes
questionTagSchema.index({ questionId: 1 });
questionTagSchema.index({ tagId: 1 });

export const QuestionTag = mongoose.model('QuestionTag', questionTagSchema);
