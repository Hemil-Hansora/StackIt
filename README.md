# StackIt – A Minimal Q&A Forum Platform

![StackIt Logo](https://via.placeholder.com/200x80/4F46E5/white?text=StackIt)

## 🎯 Overview

StackIt is a minimal question-and-answer platform that supports collaborative learning and structured knowledge sharing. It's designed to be simple, user-friendly, and focused on the core experience of asking and answering questions within a community.

## 📋 Problem Statement

### Core Challenge
Create a minimal Q&A forum platform that enables collaborative learning and structured knowledge sharing within a community. The platform should focus on the essential experience of asking and answering questions while maintaining simplicity and user-friendliness.

### User Roles & Basic Permissions
| Role | Permissions |
|------|-------------|
| **Guest** | View all questions and answers |
| **User** | Register, log in, post questions/answers, vote |
| **Admin** | Moderate content |

### Required Features

#### 1. Ask Question System
Users can submit a new question using:
- **Title** – Short and descriptive
- **Description** – Written using a rich text editor
- **Tags** – Multi-select input (e.g., React, JWT)

#### 2. Rich Text Editor Features
The description editor should support:
- **Text Formatting**: Bold, Italic, Strikethrough
- **Lists**: Numbered lists, Bullet points
- **Media**: Emoji insertion, Image upload
- **Links**: Hyperlink insertion (URL)
- **Layout**: Text alignment – Left, Center, Right

#### 3. Answering Questions
- Users can post answers to any question
- Answers can be formatted using the same rich text editor
- Only logged-in users can post answers

#### 4. Voting & Accepting Answers
- Users can upvote or downvote answers
- Question owners can mark one answer as accepted

#### 5. Tagging System
- Questions must include relevant tags

#### 6. Notification System
- A notification icon (bell) appears in the top navigation bar
- Users are notified when:
  - Someone answers their question
  - Someone comments on their answer
  - Someone mentions them using @username
- The icon shows the number of unread notifications
- Clicking the icon opens a dropdown with recent notifications

### Admin Responsibilities
- Reject inappropriate or spammy skill descriptions
- Ban users who violate platform policies
- Monitor pending, accepted, or cancelled swaps
- Send platform-wide messages (e.g., feature updates, downtime alerts)
- Download reports of user activity, feedback logs, and swap stats

### Design References
- **Main Mockup**: [View on Excalidraw](https://link.excalidraw.com/l/65VNwvy7c4X/8bM86GXnnUN)
- **Additional Mockup**: [View on Excalidraw](https://link.excalidraw.com/l/65VNwvy7c4X/9mhEahV0MQg)

## ✨ Key Features

### 🔐 User Management
- **Guest Access**: View all questions and answers
- **User Registration**: Create account, post questions/answers, vote
- **Admin Panel**: Content moderation and user management

### 📝 Question & Answer System
- Rich text editor with formatting options
- Multi-tag support for categorization
- Voting system for quality content
- Answer acceptance by question owners

### 🔔 Real-time Notifications
- Live notification system with bell icon
- Notifications for answers, comments, and mentions
- Unread count display

### 🛡️ Content Moderation
- Admin content review and moderation
- User reporting system
- Spam and inappropriate content filtering

## 🏗️ Technology Stack

_updated soon_

### Development Tools

_updated soon

## 📋 User Roles & Permissions

| Role | Permissions |
|------|-------------|
| **Guest** | • View questions and answers<br>• Browse by tags<br>• Search content |
| **User** | • All guest permissions<br>• Register and login<br>• Post questions and answers<br>• Vote on content<br>• Accept answers<br>• Receive notifications |
| **Admin** | • All user permissions<br>• Moderate content<br>• Manage users<br>• Ban/unban users<br>• Send platform announcements<br>• Access analytics |

## 🚀 Core Features (Must-Have)

### 1. 🙋‍♂️ Ask Question
Users can submit questions with:
- **Title** – Short and descriptive (max 100 characters)
- **Description** – Rich text editor with formatting
- **Tags** – Multi-select input (e.g., `React`, `JWT`, `MongoDB`)

### 2. 🎨 Rich Text Editor Features
The editor supports:
- **Text Formatting**: Bold, Italic, Strikethrough, Code blocks
- **Lists**: Numbered lists, Bullet points
- **Media**: Emoji insertion, Image upload (max 5MB)
- **Links**: Hyperlink insertion with URL validation
- **Alignment**: Left, Center, Right text alignment
- **Syntax Highlighting**: Code snippets with language detection

### 3. 💬 Answering Questions
- Post answers with rich text formatting
- Edit answers within time limit (30 minutes)
- Delete own answers
- Reply to other answers (comments)

### 4. 🗳️ Voting & Accepting Answers
- **Upvote/Downvote**: Users can vote on answers (not their own)
- **Accept Answer**: Question owners can mark one answer as accepted
- **Reputation System**: Users gain/lose points based on votes
- **Vote History**: Track voting patterns

### 5. 🏷️ Tagging System
- **Required Tags**: Questions must have 1-5 tags
- **Tag Autocomplete**: Suggests existing tags while typing
- **Tag Statistics**: Shows question count per tag
- **Popular Tags**: Displays trending tags

### 6. 🔔 Notification System
Real-time notifications for:
- Someone answers your question
- Someone comments on your answer
- Someone mentions you using `@username`
- Your answer gets accepted
- Your content receives votes

## 👨‍💼 Admin Features

### Content Moderation
- Review and approve/reject questions and answers
- Remove inappropriate or spam content
- Edit content for quality improvement

### User Management
- View user profiles and activity
- Ban/unban users for policy violations
- Send warnings to users

### Analytics & Reporting
- User activity reports
- Content statistics
- Popular tags and trending topics
- Platform usage metrics

### System Management
- Send platform-wide announcements
- Configure site settings
- Manage featured content
- Monitor system health

## 🎨 Design Reference

**UI Mockup**: [View on Excalidraw](https://link.excalidraw.com/l/65VNwvy7c4X/8bM86GXnnUN)

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v5.0 or higher)
- npm or yarn package manager

### Backend Setup
```bash
# Clone the repository
git clone https://github.com/Hemil-Hansora/StackIt.git
cd StackIt

# Install backend dependencies
cd server
npm install

# Create environment file
cp .env.example .env
# Edit .env with your configuration

# Start MongoDB service
# Windows: net start MongoDB
# macOS: brew services start mongodb-community
# Linux: sudo systemctl start mongod

# Start the backend server
npm run dev
```

### Frontend Setup
```bash
# Install frontend dependencies
cd ../client
npm install

# Start the development server
npm run dev
```

### Environment Variables
Create a `.env` file in the server directory:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/stackit
MONGODB_TEST_URI=mongodb://localhost:27017/stackit_test

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# Server
PORT=5000
NODE_ENV=development

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Email (for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

## 📚 API Documentation

_API documentation will be added as routes are implemented._

## 🧪 Testing

```bash
# Run backend tests
cd server
npm test

# Run frontend tests
cd ../client
npm test

# Run all tests with coverage
npm run test:coverage
```




## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

Meet our amazing development team:

**Hemil Hansora** - Team Lead
- GitHub: [Hemil-Hansora](https://github.com/Hemil-Hansora)

**Vrund Patel** 
- Github: [Vrund Patel](https://github.com/Vrundpatel153)
- Email: vrundpatel153@gmail.com
- Phone: 7698979593

**Meet Soni**
- Github: [Meet-Soni](https://github.com/meet1075)
- Email: meetsoni1075@gmail.com
- Phone: 6355206575

**Kaustav Das**
- Github: [Kaustav Das](https://github.com/kaustav3071)
- Email: kaustavdas2027@gmail.com
- Phone: 8488053035

## 🙏 Acknowledgments

- Inspired by Stack Overflow and similar Q&A platforms
- Built during a hackathon event
- Thanks to the open-source community for amazing tools and libraries

---

**Built with ❤️ for collaborative learning and knowledge sharing**
