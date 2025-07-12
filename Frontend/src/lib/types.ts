export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  reputation: number;
  badges: Badge[];
  joinDate: string;
  role: 'guest' | 'user' | 'admin';
}

export interface Question {
  id: string;
  title: string;
  body: string;
  excerpt: string;
  tags: string[];
  authorId: string;
  createdAt: string;
  updatedAt: string;
  votes: number;
  views: number;
  answerCount: number;
  acceptedAnswerId?: string;
}

export interface Answer {
  id: string;
  questionId: string;
  body: string;
  authorId: string;
  createdAt: string;
  votes: number;
  isAccepted: boolean;
}

export interface Comment {
  id: string;
  parentId: string;
  parentType: 'question' | 'answer';
  body: string;
  authorId: string;
  createdAt: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'answer' | 'comment' | 'mention' | 'vote' | 'accepted';
  title: string;
  message: string;
  relatedId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface Vote {
  id: string;
  userId: string;
  targetId: string;
  targetType: 'question' | 'answer';
  type: 'up' | 'down';
}