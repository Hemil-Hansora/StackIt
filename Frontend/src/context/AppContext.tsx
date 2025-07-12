import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, Question, Answer, Notification, Comment, Vote, Badge } from '../lib/types';
import { mockUsers, mockQuestions, mockAnswers, mockNotifications, mockComments, mockBadges } from '../lib/mock-data';

interface AppState {
  // Auth
  currentUser: User | null;
  isAuthenticated: boolean;
  
  // Data
  users: User[];
  questions: Question[];
  answers: Answer[];
  notifications: Notification[];
  comments: Comment[];
  votes: Vote[];
  badges: Badge[];
  
  // UI
  theme: 'light' | 'dark';
  searchQuery: string;
  selectedTags: string[];
  sortBy: 'newest' | 'votes' | 'unanswered' | 'trending';
}

type AppAction = 
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'REGISTER'; payload: User }
  | { type: 'UPDATE_USER'; payload: Partial<User> & { id: string } }
  | { type: 'SET_QUESTIONS'; payload: Question[] }
  | { type: 'ADD_QUESTION'; payload: Question }
  | { type: 'UPDATE_QUESTION'; payload: Partial<Question> & { id: string } }
  | { type: 'ADD_ANSWER'; payload: Answer }
  | { type: 'UPDATE_ANSWER'; payload: Partial<Answer> & { id: string } }
  | { type: 'ADD_COMMENT'; payload: Comment }
  | { type: 'VOTE'; payload: Vote }
  | { type: 'REMOVE_VOTE'; payload: { userId: string; targetId: string } }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'MARK_ALL_NOTIFICATIONS_READ'; payload: string }
  | { type: 'TOGGLE_THEME' }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_SELECTED_TAGS'; payload: string[] }
  | { type: 'SET_SORT_BY'; payload: 'newest' | 'votes' | 'unanswered' | 'trending' }
  | { type: 'INCREMENT_VIEW_COUNT'; payload: string }
  | { type: 'AWARD_BADGE'; payload: { userId: string; badge: Badge } };

const initialState: AppState = {
  currentUser: null,
  isAuthenticated: false,
  users: mockUsers,
  questions: mockQuestions,
  answers: mockAnswers,
  notifications: mockNotifications,
  comments: mockComments,
  votes: [],
  badges: mockBadges,
  theme: 'light',
  searchQuery: '',
  selectedTags: [],
  sortBy: 'newest'
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        currentUser: action.payload,
        isAuthenticated: true
      };
      
    case 'LOGOUT':
      return {
        ...state,
        currentUser: null,
        isAuthenticated: false
      };
      
    case 'REGISTER':
      return {
        ...state,
        users: [...state.users, action.payload],
        currentUser: action.payload,
        isAuthenticated: true
      };
      
    case 'UPDATE_USER':
      return {
        ...state,
        users: state.users.map(user => 
          user.id === action.payload.id 
            ? { ...user, ...action.payload }
            : user
        ),
        currentUser: state.currentUser?.id === action.payload.id 
          ? { ...state.currentUser, ...action.payload }
          : state.currentUser
      };

    case 'SET_QUESTIONS':
      return {
        ...state,
        questions: action.payload
      };
      
    case 'ADD_QUESTION':
      return {
        ...state,
        questions: [action.payload, ...state.questions]
      };
      
    case 'UPDATE_QUESTION':
      return {
        ...state,
        questions: state.questions.map(question =>
          question.id === action.payload.id
            ? { ...question, ...action.payload }
            : question
        )
      };
      
    case 'ADD_ANSWER':
      return {
        ...state,
        answers: [...state.answers, action.payload],
        questions: state.questions.map(question =>
          question.id === action.payload.questionId
            ? { ...question, answerCount: question.answerCount + 1 }
            : question
        )
      };
      
    case 'UPDATE_ANSWER':
      return {
        ...state,
        answers: state.answers.map(answer =>
          answer.id === action.payload.id
            ? { ...answer, ...action.payload }
            : answer
        )
      };
      
    case 'ADD_COMMENT':
      return {
        ...state,
        comments: [...state.comments, action.payload]
      };
      
    case 'VOTE': {
      const existingVoteIndex = state.votes.findIndex(
        vote => vote.userId === action.payload.userId && vote.targetId === action.payload.targetId
      );
      
      const newVotes = [...state.votes];
      let voteChange = 0;
      
      if (existingVoteIndex >= 0) {
        const existingVote = state.votes[existingVoteIndex];
        if (existingVote.type === action.payload.type) {
          // Remove vote if clicking same button
          newVotes.splice(existingVoteIndex, 1);
          voteChange = action.payload.type === 'up' ? -1 : 1;
        } else {
          // Change vote type
          newVotes[existingVoteIndex] = action.payload;
          voteChange = action.payload.type === 'up' ? 2 : -2;
        }
      } else {
        // Add new vote
        newVotes.push(action.payload);
        voteChange = action.payload.type === 'up' ? 1 : -1;
      }
      
      return {
        ...state,
        votes: newVotes,
        questions: action.payload.targetType === 'question' 
          ? state.questions.map(question =>
              question.id === action.payload.targetId
                ? { ...question, votes: question.votes + voteChange }
                : question
            )
          : state.questions,
        answers: action.payload.targetType === 'answer'
          ? state.answers.map(answer =>
              answer.id === action.payload.targetId
                ? { ...answer, votes: answer.votes + voteChange }
                : answer
            )
          : state.answers
      };
    }
      
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications]
      };
      
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload
            ? { ...notification, isRead: true }
            : notification
        )
      };
      
    case 'MARK_ALL_NOTIFICATIONS_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.userId === action.payload
            ? { ...notification, isRead: true }
            : notification
        )
      };
      
    case 'TOGGLE_THEME': {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      return {
        ...state,
        theme: newTheme
      };
    }
      
    case 'SET_SEARCH_QUERY':
      return {
        ...state,
        searchQuery: action.payload
      };
      
    case 'SET_SELECTED_TAGS':
      return {
        ...state,
        selectedTags: action.payload
      };
      
    case 'SET_SORT_BY':
      return {
        ...state,
        sortBy: action.payload
      };
      
    case 'INCREMENT_VIEW_COUNT':
      return {
        ...state,
        questions: state.questions.map(question =>
          question.id === action.payload
            ? { ...question, views: question.views + 1 }
            : question
        )
      };
      
    case 'AWARD_BADGE':
      return {
        ...state,
        users: state.users.map(user =>
          user.id === action.payload.userId
            ? { 
                ...user, 
                badges: user.badges.some(b => b.id === action.payload.badge.id)
                  ? user.badges
                  : [...user.badges, action.payload.badge]
              }
            : user
        )
      };
      
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme && savedTheme !== state.theme) {
      dispatch({ type: 'TOGGLE_THEME' });
    }
  }, [state.theme, dispatch]);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.theme === 'dark');
  }, [state.theme]);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        dispatch({ type: 'LOGIN', payload: user });
      } catch {
        localStorage.removeItem('currentUser');
      }
    }
  }, []);

  // Save user to localStorage when authenticated
  useEffect(() => {
    if (state.currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(state.currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [state.currentUser]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}