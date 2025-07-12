import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mockUsers, mockQuestions, mockAnswers, mockNotifications, User, Question, Answer, Notification } from '../lib/mock-data';

interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  register: (name: string, email: string) => boolean;
}

interface QnaState {
  questions: Question[];
  answers: Answer[];
  notifications: Notification[];
  users: User[];
  searchQuery: string;
  selectedTags: string[];
  sortBy: 'newest' | 'votes' | 'unanswered';
  
  // Actions
  setSearchQuery: (query: string) => void;
  setSelectedTags: (tags: string[]) => void;
  setSortBy: (sort: 'newest' | 'votes' | 'unanswered') => void;
  addQuestion: (question: Omit<Question, 'id' | 'createdAt' | 'votes' | 'answerCount' | 'viewCount'>) => string;
  addAnswer: (answer: Omit<Answer, 'id' | 'createdAt' | 'votes' | 'isAccepted'>) => void;
  voteQuestion: (questionId: string, direction: 'up' | 'down') => void;
  voteAnswer: (answerId: string, direction: 'up' | 'down') => void;
  acceptAnswer: (answerId: string, questionId: string) => void;
  markNotificationRead: (notificationId: string) => void;
  incrementViewCount: (questionId: string) => void;
  getUserById: (userId: string) => User | undefined;
  getQuestionById: (questionId: string) => Question | undefined;
  getAnswersByQuestionId: (questionId: string) => Answer[];
  getFilteredQuestions: () => Question[];
}

interface ThemeState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

// Auth Store
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      currentUser: null,
      isAuthenticated: false,
      
      login: (email: string, password: string) => {
        // Mock authentication - in real app, this would call an API
        const user = mockUsers.find(u => u.email === email);
        if (user && password === 'password') {
          set({ currentUser: user, isAuthenticated: true });
          return true;
        }
        return false;
      },
      
      logout: () => {
        set({ currentUser: null, isAuthenticated: false });
      },
      
      register: (name: string, email: string) => {
        // Mock registration
        const existingUser = mockUsers.find(u => u.email === email);
        if (existingUser) return false;
        
        const newUser: User = {
          id: Date.now().toString(),
          name,
          email,
          avatarUrl: 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=150',
          reputation: 1,
          badges: ['New Member'],
          joinDate: new Date().toISOString()
        };
        
        mockUsers.push(newUser);
        set({ currentUser: newUser, isAuthenticated: true });
        return true;
      }
    }),
    {
      name: 'auth-storage'
    }
  )
);

// QnA Store
export const useQnaStore = create<QnaState>()(
  persist(
    (set, get) => ({
      questions: mockQuestions,
      answers: mockAnswers,
      notifications: mockNotifications,
      users: mockUsers,
      searchQuery: '',
      selectedTags: [],
      sortBy: 'newest',
      
      setSearchQuery: (query: string) => set({ searchQuery: query }),
      setSelectedTags: (tags: string[]) => set({ selectedTags: tags }),
      setSortBy: (sort: 'newest' | 'votes' | 'unanswered') => set({ sortBy: sort }),
      
      addQuestion: (questionData) => {
        const newQuestion: Question = {
          ...questionData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          votes: 0,
          answerCount: 0,
          viewCount: 0
        };
        
        set(state => ({
          questions: [newQuestion, ...state.questions]
        }));
        
        return newQuestion.id;
      },
      
      addAnswer: (answerData) => {
        const newAnswer: Answer = {
          ...answerData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          votes: 0,
          isAccepted: false
        };
        
        set(state => ({
          answers: [...state.answers, newAnswer],
          questions: state.questions.map(q => 
            q.id === answerData.questionId 
              ? { ...q, answerCount: q.answerCount + 1 }
              : q
          )
        }));
        
        // Add notification for question author
        const question = get().questions.find(q => q.id === answerData.questionId);
        if (question && question.authorId !== answerData.authorId) {
          const newNotification: Notification = {
            id: Date.now().toString(),
            userId: question.authorId,
            type: 'answer',
            message: `Someone answered your question: ${question.title}`,
            createdAt: new Date().toISOString(),
            read: false,
            relatedId: question.id
          };
          
          set(state => ({
            notifications: [newNotification, ...state.notifications]
          }));
        }
      },
      
      voteQuestion: (questionId: string, direction: 'up' | 'down') => {
        const voteValue = direction === 'up' ? 1 : -1;
        
        set(state => ({
          questions: state.questions.map(q => 
            q.id === questionId 
              ? { ...q, votes: q.votes + voteValue }
              : q
          )
        }));
        
        // Update author reputation
        const question = get().questions.find(q => q.id === questionId);
        if (question) {
          const reputationChange = direction === 'up' ? 10 : -2;
          set(state => ({
            users: state.users.map(u => 
              u.id === question.authorId 
                ? { ...u, reputation: Math.max(0, u.reputation + reputationChange) }
                : u
            )
          }));
        }
      },
      
      voteAnswer: (answerId: string, direction: 'up' | 'down') => {
        const voteValue = direction === 'up' ? 1 : -1;
        
        set(state => ({
          answers: state.answers.map(a => 
            a.id === answerId 
              ? { ...a, votes: a.votes + voteValue }
              : a
          )
        }));
        
        // Update author reputation
        const answer = get().answers.find(a => a.id === answerId);
        if (answer) {
          const reputationChange = direction === 'up' ? 10 : -2;
          set(state => ({
            users: state.users.map(u => 
              u.id === answer.authorId 
                ? { ...u, reputation: Math.max(0, u.reputation + reputationChange) }
                : u
            )
          }));
        }
      },
      
      acceptAnswer: (answerId: string, questionId: string) => {
        set(state => ({
          answers: state.answers.map(a => 
            a.questionId === questionId 
              ? { ...a, isAccepted: a.id === answerId }
              : a
          ),
          questions: state.questions.map(q => 
            q.id === questionId 
              ? { ...q, acceptedAnswerId: answerId }
              : q
          )
        }));
        
        // Add reputation bonus for accepted answer
        const answer = get().answers.find(a => a.id === answerId);
        if (answer) {
          set(state => ({
            users: state.users.map(u => 
              u.id === answer.authorId 
                ? { ...u, reputation: u.reputation + 15 }
                : u
            )
          }));
          
          // Add notification
          const newNotification: Notification = {
            id: Date.now().toString(),
            userId: answer.authorId,
            type: 'accepted',
            message: 'Your answer was accepted!',
            createdAt: new Date().toISOString(),
            read: false,
            relatedId: questionId
          };
          
          set(state => ({
            notifications: [newNotification, ...state.notifications]
          }));
        }
      },
      
      markNotificationRead: (notificationId: string) => {
        set(state => ({
          notifications: state.notifications.map(n => 
            n.id === notificationId 
              ? { ...n, read: true }
              : n
          )
        }));
      },
      
      incrementViewCount: (questionId: string) => {
        set(state => ({
          questions: state.questions.map(q => 
            q.id === questionId 
              ? { ...q, viewCount: q.viewCount + 1 }
              : q
          )
        }));
      },
      
      getUserById: (userId: string) => {
        return get().users.find(u => u.id === userId);
      },
      
      getQuestionById: (questionId: string) => {
        return get().questions.find(q => q.id === questionId);
      },
      
      getAnswersByQuestionId: (questionId: string) => {
        return get().answers.filter(a => a.questionId === questionId);
      },
      
      getFilteredQuestions: () => {
        const { questions, searchQuery, selectedTags, sortBy } = get();
        
        let filtered = questions.filter(q => {
          const matchesSearch = !searchQuery || 
            q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.body.toLowerCase().includes(searchQuery.toLowerCase());
          
          const matchesTags = selectedTags.length === 0 || 
            selectedTags.some(tag => q.tags.includes(tag));
          
          return matchesSearch && matchesTags;
        });
        
        // Apply sorting
        switch (sortBy) {
          case 'votes':
            filtered.sort((a, b) => b.votes - a.votes);
            break;
          case 'unanswered':
            filtered = filtered.filter(q => q.answerCount === 0);
            filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            break;
          case 'newest':
          default:
            filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            break;
        }
        
        return filtered;
      }
    }),
    {
      name: 'qna-storage'
    }
  )
);

// Theme Store
export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      
      toggleTheme: () => {
        const newTheme = get().theme === 'light' ? 'dark' : 'light';
        set({ theme: newTheme });
        
        // Apply theme to document
        if (newTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    }),
    {
      name: 'theme-storage'
    }
  )
);

export default useThemeStore