# StackIt Database Models

This directory contains all the Mongoose models for the StackIt Q&A platform. The models follow a simplified, clean structure focused on core functionality.

## 📋 Models Overview

### Core Models
- **User.model.js** - User accounts and profiles
- **Question.model.js** - Questions posted by users
- **Answer.model.js** - Answers to questions
- **Tag.model.js** - Tags for categorizing questions
- **QuestionTag.model.js** - Many-to-many relationship between questions and tags
- **Vote.model.js** - Voting system for answers
- **Comment.model.js** - Comments on answers
- **Notification.model.js** - User notifications

## 🔗 Database Schema

### Question Model
```javascript
Question {
  id: ObjectId (Primary Key)
  userId: ObjectId (Foreign Key → User._id)
  title: String
  description: Mixed (Rich Text JSON or HTML)
  acceptedAnswerId: ObjectId (nullable, FK → Answer._id)
  createdAt: Date (auto-generated)
  updatedAt: Date (auto-generated)
}
```

### Answer Model
```javascript
Answer {
  id: ObjectId (Primary Key)
  questionId: ObjectId (Foreign Key → Question._id)
  userId: ObjectId (Foreign Key → User._id)
  content: Mixed (Rich Text)
  isAccepted: Boolean (default: false)
  createdAt: Date (auto-generated)
  updatedAt: Date (auto-generated)
}
```

### Tag Model
```javascript
Tag {
  id: ObjectId (Primary Key)
  name: String (Unique)
  createdAt: Date (auto-generated)
}
```

### QuestionTag Model (Many-to-Many)
```javascript
QuestionTag {
  id: ObjectId (Primary Key)
  questionId: ObjectId (Foreign Key → Question._id)
  tagId: ObjectId (Foreign Key → Tag._id)
  createdAt: Date (auto-generated)
  updatedAt: Date (auto-generated)
}
```

### Vote Model
```javascript
Vote {
  id: ObjectId (Primary Key)
  userId: ObjectId (FK → User._id)
  answerId: ObjectId (FK → Answer._id)
  value: Number // -1 for downvote, +1 for upvote
  createdAt: Date (auto-generated)
}
```

### Notification Model
```javascript
Notification {
  id: ObjectId (Primary Key)
  recipientId: ObjectId (FK → User._id)
  type: String // enum: "ANSWER", "COMMENT", "MENTION"
  message: String
  isRead: Boolean (default: false)
  link: String (URL to question/answer)
  createdAt: Date (auto-generated)
}
```

### Comment Model
```javascript
Comment {
  id: ObjectId (Primary Key)
  userId: ObjectId (FK → User._id)
  answerId: ObjectId (FK → Answer._id)
  content: String
  createdAt: Date (auto-generated)
}
```

## 🚀 Usage

Import individual models:
```javascript
import { Question, Answer, Tag } from './models/index.js';
```

Or import all models:
```javascript
import models from './models/index.js';
const { Question, Answer, Tag } = models;
```

## 📝 Key Features

### Automatic Timestamps
All models include automatic `createdAt` and `updatedAt` timestamps using Mongoose's `timestamps: true` option.

### Optimized Indexes
Each model includes performance-optimized indexes for:
- Foreign key relationships
- Common query patterns
- Unique constraints
- Text search capabilities

### Virtual Properties
Models include virtual properties for:
- URL generation
- Computed values
- Helper methods

### Data Validation
Comprehensive validation rules for:
- Required fields
- String length limits
- Enum values
- Custom validators

## 🔧 Development

### Adding New Models
1. Create a new `.model.js` file in this directory
2. Follow the existing naming convention
3. Export the model using ES6 modules
4. Add the import/export to `index.js`
5. Update this README

### Model Structure Template
```javascript
import mongoose from 'mongoose';

const modelSchema = new mongoose.Schema({
  // Define your schema here
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add indexes
modelSchema.index({ field: 1 });

// Add virtuals if needed
modelSchema.virtual('virtualProperty').get(function() {
  return 'computed value';
});

export default mongoose.model('ModelName', modelSchema);
```

## 📊 Relationships

### One-to-Many Relationships
- User → Questions (one user can have many questions)
- User → Answers (one user can have many answers)
- Question → Answers (one question can have many answers)
- Answer → Comments (one answer can have many comments)
- Answer → Votes (one answer can have many votes)

### Many-to-Many Relationships
- Questions ↔ Tags (through QuestionTag junction table)

### One-to-One Relationships
- Question → AcceptedAnswer (optional, one question can have one accepted answer)

This simplified structure focuses on core functionality while maintaining clean, maintainable code and optimal database performance.
