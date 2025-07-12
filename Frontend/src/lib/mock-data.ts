import { User, Question, Answer, Badge, Notification, Comment } from './types';

export const mockBadges: Badge[] = [
  { id: '1', name: 'First Post', description: 'Posted your first question or answer', icon: '🎯', color: 'bg-blue-500' },
  { id: '2', name: '50 Upvotes', description: 'Received 50 upvotes', icon: '👍', color: 'bg-green-500' },
  { id: '3', name: '100 Upvotes', description: 'Received 100 upvotes', icon: '🔥', color: 'bg-orange-500' },
  { id: '4', name: 'Expert', description: 'Answered 10 questions with accepted answers', icon: '🏆', color: 'bg-yellow-500' },
  { id: '5', name: 'Mentor', description: 'Helped 50 users with answers', icon: '🎓', color: 'bg-purple-500' },
  { id: '6', name: 'Community Leader', description: 'Top contributor in the community', icon: '👑', color: 'bg-red-500' },
];

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
    bio: 'Full-stack developer with 5+ years of experience in React and Node.js',
    reputation: 2847,
    badges: [mockBadges[0], mockBadges[1]],
    joinDate: '2023-01-15',
    role: 'user'
  },
  {
    id: '2',
    name: 'Alice Smith',
    email: 'alice@example.com',
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150',
    bio: 'Senior React developer and open source contributor',
    reputation: 4521,
    badges: [mockBadges[0], mockBadges[1], mockBadges[2], mockBadges[3]],
    joinDate: '2022-11-08',
    role: 'user'
  },
  {
    id: '3',
    name: 'Bob Wilson',
    email: 'bob@example.com',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
    bio: 'Backend engineer specializing in microservices',
    reputation: 1923,
    badges: [mockBadges[0]],
    joinDate: '2023-03-22',
    role: 'user'
  },
  {
    id: '4',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
    bio: 'UI/UX designer and frontend developer',
    reputation: 3156,
    badges: [mockBadges[0], mockBadges[1], mockBadges[4]],
    joinDate: '2022-12-10',
    role: 'user'
  },
  {
    id: '5',
    name: 'Admin User',
    email: 'admin@example.com',
    avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150',
    bio: 'Platform administrator and community moderator',
    reputation: 5234,
    badges: [mockBadges[0], mockBadges[1], mockBadges[2], mockBadges[3], mockBadges[4], mockBadges[5]],
    joinDate: '2022-08-15',
    role: 'admin'
  }
];

export const mockQuestions: Question[] = [
  {
    id: '1',
    title: 'How to implement React hooks properly?',
    body: `<p>I'm having trouble understanding the proper way to implement React hooks in my application. Can someone explain the best practices?</p>
    <p>Specifically, I'm confused about:</p>
    <ul>
      <li>When to use useState vs useReducer</li>
      <li>How to handle side effects with useEffect</li>
      <li>Custom hooks implementation</li>
    </ul>
    <p>Here's a code example of what I'm trying to achieve:</p>
    <pre><code>const MyComponent = () => {
      const [user, setUser] = useState(null);
      const [theme, setTheme] = useState('light');
      
      return &lt;div&gt;...&lt;/div&gt;;
    };</code></pre>`,
    excerpt: 'I\'m having trouble understanding the proper way to implement React hooks in my application. Can someone explain the best practices?',
    tags: ['react', 'hooks', 'javascript', 'frontend'],
    authorId: '1',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    votes: 15,
    views: 234,
    answerCount: 3,
    acceptedAnswerId: '1'
  },
  {
    id: '2',
    title: 'Best practices for TypeScript in large projects',
    body: `<p>What are the recommended patterns and practices when working with TypeScript in large-scale applications?</p>
    <p>I'm particularly interested in:</p>
    <ul>
      <li>Type organization and structure</li>
      <li>Interface vs Type aliases</li>
      <li>Generic constraints</li>
      <li>Module organization</li>
    </ul>`,
    excerpt: 'What are the recommended patterns and practices when working with TypeScript in large-scale applications?',
    tags: ['typescript', 'best-practices', 'architecture', 'javascript'],
    authorId: '2',
    createdAt: '2024-01-14T14:20:00Z',
    updatedAt: '2024-01-14T14:20:00Z',
    votes: 23,
    views: 456,
    answerCount: 5
  },
  {
    id: '3',
    title: 'CSS Grid vs Flexbox: When to use which?',
    body: `<p>I often find myself confused about when to use CSS Grid versus Flexbox for layouts. Can someone clarify the differences and use cases?</p>
    <p><strong>My current understanding:</strong></p>
    <ul>
      <li>Flexbox is for 1D layouts</li>
      <li>Grid is for 2D layouts</li>
    </ul>
    <p>But I'd love more practical examples and guidance.</p>`,
    excerpt: 'I often find myself confused about when to use CSS Grid versus Flexbox for layouts.',
    tags: ['css', 'layout', 'grid', 'flexbox', 'frontend'],
    authorId: '3',
    createdAt: '2024-01-13T09:15:00Z',
    updatedAt: '2024-01-13T09:15:00Z',
    votes: 8,
    views: 189,
    answerCount: 2
  },
  {
    id: '4',
    title: 'How to optimize React app performance?',
    body: `<p>My React application is getting slower as it grows. What are the best techniques to optimize performance?</p>
    <p><strong>Current issues:</strong></p>
    <ul>
      <li>Slow initial load</li>
      <li>Laggy interactions</li>
      <li>Memory leaks</li>
    </ul>
    <p>I've tried React.memo but it's not enough. Looking for comprehensive optimization strategies.</p>`,
    excerpt: 'My React application is getting slower as it grows. What are the best techniques to optimize performance?',
    tags: ['react', 'performance', 'optimization', 'javascript'],
    authorId: '4',
    createdAt: '2024-01-12T16:45:00Z',
    updatedAt: '2024-01-12T16:45:00Z',
    votes: 31,
    views: 678,
    answerCount: 7
  },
  {
    id: '5',
    title: 'Understanding JavaScript closures with examples',
    body: `<p>Can someone explain JavaScript closures with practical examples? I understand the concept theoretically but struggle with real-world applications.</p>
    <p>I've read multiple articles but I'm still confused about:</p>
    <ul>
      <li>How closures work in practice</li>
      <li>Common use cases</li>
      <li>Performance implications</li>
    </ul>`,
    excerpt: 'Can someone explain JavaScript closures with practical examples?',
    tags: ['javascript', 'closures', 'fundamentals', 'concepts'],
    authorId: '5',
    createdAt: '2024-01-11T11:30:00Z',
    updatedAt: '2024-01-11T11:30:00Z',
    votes: 19,
    views: 345,
    answerCount: 4
  }
];

export const mockAnswers: Answer[] = [
  {
    id: '1',
    questionId: '1',
    body: `<p>Great question! Here are the key principles for React hooks:</p>
    <h3>useState vs useReducer</h3>
    <p>Use <code>useState</code> for simple state updates and <code>useReducer</code> for complex state logic with multiple sub-values or when the next state depends on the previous one.</p>
    <h3>useEffect best practices</h3>
    <ul>
      <li>Always include dependencies in the dependency array</li>
      <li>Use cleanup functions for subscriptions</li>
      <li>Separate concerns into multiple useEffect calls</li>
    </ul>
    <p><strong>Example:</strong></p>
    <pre><code>useEffect(() => {
      const subscription = api.subscribe(data => {
        setData(data);
      });
      
      return () => subscription.unsubscribe();
    }, []);</code></pre>`,
    authorId: '2',
    createdAt: '2024-01-15T11:15:00Z',
    votes: 12,
    isAccepted: true
  },
  {
    id: '2',
    questionId: '1',
    body: `<p>Additionally, here's a custom hook example:</p>
    <pre><code>function useLocalStorage(key, initialValue) {
      const [storedValue, setStoredValue] = useState(() => {
        try {
          const item = window.localStorage.getItem(key);
          return item ? JSON.parse(item) : initialValue;
        } catch (error) {
          return initialValue;
        }
      });

      const setValue = (value) => {
        try {
          setStoredValue(value);
          window.localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
          console.error(error);
        }
      };

      return [storedValue, setValue];
    }</code></pre>
    <p>This pattern is very useful for persisting state across page reloads.</p>`,
    authorId: '5',
    createdAt: '2024-01-15T12:30:00Z',
    votes: 8,
    isAccepted: false
  },
  {
    id: '3',
    questionId: '2',
    body: `<p>For large TypeScript projects, I recommend:</p>
    <h3>Type Organization</h3>
    <ul>
      <li>Create a <code>types/</code> directory for shared types</li>
      <li>Use barrel exports (index.ts files)</li>
      <li>Group related types together</li>
    </ul>
    <h3>Interface vs Type</h3>
    <p>Use interfaces for object shapes that might be extended, and type aliases for unions, primitives, and computed types.</p>
    <pre><code>// Interface for extensible objects
interface User {
  id: string;
  name: string;
}

// Type for unions and computed types
type Status = 'loading' | 'success' | 'error';
type UserWithStatus = User & { status: Status };</code></pre>`,
    authorId: '1',
    createdAt: '2024-01-14T15:00:00Z',
    votes: 15,
    isAccepted: false
  },
  {
    id: '4',
    questionId: '3',
    body: `<p>Here's when to use each:</p>
    <h3>Use Flexbox when:</h3>
    <ul>
      <li>Arranging items in a single dimension (row or column)</li>
      <li>You need items to grow/shrink</li>
      <li>Centering content</li>
      <li>Creating navigation bars</li>
    </ul>
    <h3>Use CSS Grid when:</h3>
    <ul>
      <li>Creating two-dimensional layouts</li>
      <li>You need precise control over both rows and columns</li>
      <li>Building complex page layouts</li>
      <li>Creating card-based designs</li>
    </ul>
    <p><strong>Example:</strong> Use Grid for the overall page layout, Flexbox for component internals.</p>`,
    authorId: '4',
    createdAt: '2024-01-13T10:00:00Z',
    votes: 6,
    isAccepted: false
  }
];

export const mockComments: Comment[] = [
  {
    id: '1',
    parentId: '1',
    parentType: 'answer',
    body: 'Great explanation! The useEffect example really helped me understand.',
    authorId: '3',
    createdAt: '2024-01-15T13:00:00Z'
  },
  {
    id: '2',
    parentId: '1',
    parentType: 'question',
    body: 'Have you considered using Zustand for state management?',
    authorId: '4',
    createdAt: '2024-01-15T14:00:00Z'
  }
];

export const mockNotifications: Notification[] = [
  {
    id: '1',
    userId: '1',
    type: 'answer',
    title: 'New answer on your question',
    message: 'Alice Smith answered your question about React hooks',
    relatedId: '1',
    isRead: false,
    createdAt: '2024-01-15T11:15:00Z'
  },
  {
    id: '2',
    userId: '1',
    type: 'vote',
    title: 'Your question was upvoted',
    message: 'Someone upvoted your question about React hooks',
    relatedId: '1',
    isRead: false,
    createdAt: '2024-01-15T09:30:00Z'
  },
  {
    id: '3',
    userId: '2',
    type: 'accepted',
    title: 'Your answer was accepted!',
    message: 'John Doe accepted your answer about React hooks',
    relatedId: '1',
    isRead: true,
    createdAt: '2024-01-15T11:20:00Z'
  },
  {
    id: '4',
    userId: '3',
    type: 'mention',
    title: 'You were mentioned',
    message: 'Sarah Johnson mentioned you in a comment',
    relatedId: '2',
    isRead: false,
    createdAt: '2024-01-14T16:45:00Z'
  }
];

export const availableTags = [
  'react', 'javascript', 'typescript', 'css', 'html', 'node.js', 'express',
  'mongodb', 'postgresql', 'tailwind', 'bootstrap', 'vue', 'angular',
  'python', 'django', 'flask', 'java', 'spring', 'git', 'docker',
  'aws', 'firebase', 'api', 'rest', 'graphql', 'testing', 'jest',
  'cypress', 'performance', 'optimization', 'responsive-design',
  'state-management', 'redux', 'context-api', 'hooks', 'components',
  'frontend', 'backend', 'fullstack', 'database', 'authentication',
  'security', 'deployment', 'ci-cd', 'microservices', 'architecture'
];