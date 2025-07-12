# StackIt – A Minimal Q&A Forum Platform

## Overview

StackIt is a minimal question-and-answer platform that supports collaborative learning and structured knowledge sharing. It's designed to be simple, user-friendly, and focused on the core experience of asking and answering questions within a community.

## User Roles

| Role | Permissions |
|------|-------------|
| **Guest** | View all questions and answers |
| **User** | Register, log in, post questions/answers, vote |
| **Admin** | Moderate content |

## Core Features (Must-Have)

### 1. Ask Question
Users can submit a new question using:
- **Title** – Short and descriptive
- **Description** – Written using a rich text editor
- **Tags** – Multi-select input (e.g., React, JWT)

### 2. Rich Text Editor Features
The description editor should support:
- **Text formatting**: Bold, Italic, Strikethrough
- **Lists**: Numbered lists, Bullet points
- **Media**: Emoji insertion, Image upload
- **Links**: Hyperlink insertion (URL)
- **Alignment**: Text alignment – Left, Center, Right

### 3. Answering Questions
- Users can post answers to any question
- Answers can be formatted using the same rich text editor
- Only logged-in users can post answers

### 4. Voting & Accepting Answers
- Users can upvote or downvote answers
- Question owners can mark one answer as accepted

### 5. Tagging
- Questions must include relevant tags

### 6. Notification System
A notification icon (bell) appears in the top navigation bar. Users are notified when:
- Someone answers their question
- Someone comments on their answer
- Someone mentions them using @username

The icon shows the number of unread notifications. Clicking the icon opens a dropdown with recent notifications.

## Admin Role

Administrators have additional capabilities:
- **Content Moderation**: Reject inappropriate or spammy skill descriptions
- **User Management**: Ban users who violate platform policies
- **System Monitoring**: Monitor pending, accepted, or cancelled swaps
- **Communication**: Send platform-wide messages (e.g., feature updates, downtime alerts)
- **Analytics**: Download reports of user activity, feedback logs, and swap stats

## Design Reference

**Mockup**: [View on Excalidraw](https://link.excalidraw.com/l/65VNwvy7c4X/8bM86GXnnUN)

## Getting Started

_Instructions for setting up and running the project will be added here._

## Technology Stack

_Technology stack details will be added here._

## Contributing

_Contributing guidelines will be added here._

## License

_License information will be added here._
