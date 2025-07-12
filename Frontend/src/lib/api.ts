const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

// API Response types
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

interface LoginResponse {
  user: {
    _id: string;
    username: string;
    email: string;
    role: string;
    avatar?: string;
    bio?: string;
    reputation?: number;
    badges?: any[];
    createdAt: string;
  };
  accessToken: string;
}

interface RegisterResponse {
  _id: string;
  username: string;
  email: string;
  role: string;
  avatar?: string;
  bio?: string;
  reputation?: number;
  badges?: any[];
  createdAt: string;
}

class ApiService {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Include cookies for authentication
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
    return this.request<LoginResponse>('/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: {
    username: string;
    email: string;
    password: string;
    role?: string;
  }): Promise<ApiResponse<RegisterResponse>> {
    return this.request<RegisterResponse>('/users/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout(): Promise<ApiResponse<{}>> {
    return this.request<{}>('/users/logout', {
      method: 'POST',
    });
  }

  // Question endpoints
  async getQuestions(params?: {
    page?: number;
    limit?: number;
    tags?: string;
    search?: string;
    sortBy?: string;
  }): Promise<ApiResponse<any>> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = searchParams.toString();
    return this.request<any>(`/questions${queryString ? `?${queryString}` : ''}`);
  }

  async getQuestionById(id: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/questions/${id}`);
  }

  async createQuestion(questionData: {
    title: string;
    body: string;
    tags?: string[];
  }): Promise<ApiResponse<any>> {
    return this.request<any>('/questions', {
      method: 'POST',
      body: JSON.stringify(questionData),
    });
  }

  async updateQuestion(id: string, questionData: {
    title?: string;
    body?: string;
    tags?: string[];
  }) {
    return this.request(`/questions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(questionData),
    });
  }

  async deleteQuestion(id: string) {
    return this.request(`/questions/${id}`, {
      method: 'DELETE',
    });
  }

  async searchQuestions(query: string, page?: number, limit?: number) {
    const searchParams = new URLSearchParams({ q: query });
    if (page) searchParams.append('page', page.toString());
    if (limit) searchParams.append('limit', limit.toString());
    
    return this.request(`/questions/search?${searchParams.toString()}`);
  }

  async getUserQuestions(userId: string, page?: number, limit?: number) {
    const searchParams = new URLSearchParams();
    if (page) searchParams.append('page', page.toString());
    if (limit) searchParams.append('limit', limit.toString());
    
    const queryString = searchParams.toString();
    return this.request(`/questions/user/${userId}${queryString ? `?${queryString}` : ''}`);
  }

  // Answer endpoints
  async createAnswer(questionId: string, body: string) {
    return this.request('/answers', {
      method: 'POST',
      body: JSON.stringify({ questionId, body }),
    });
  }

  async updateAnswer(id: string, body: string) {
    return this.request(`/answers/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ body }),
    });
  }

  async deleteAnswer(id: string) {
    return this.request(`/answers/${id}`, {
      method: 'DELETE',
    });
  }

  async acceptAnswer(questionId: string, answerId: string) {
    return this.request(`/questions/${questionId}/accept/${answerId}`, {
      method: 'PUT',
    });
  }

  // Vote endpoints
  async vote(targetId: string, targetType: 'question' | 'answer', voteType: 'up' | 'down') {
    return this.request('/votes', {
      method: 'POST',
      body: JSON.stringify({ targetId, targetType, voteType }),
    });
  }

  async removeVote(targetId: string) {
    return this.request(`/votes/${targetId}`, {
      method: 'DELETE',
    });
  }

  // Tag endpoints
  async getTags() {
    return this.request('/tags');
  }

  async createTag(name: string, description?: string) {
    return this.request('/tags', {
      method: 'POST',
      body: JSON.stringify({ name, description }),
    });
  }

  // Notification endpoints
  async getNotifications() {
    return this.request('/notifications');
  }

  async markNotificationRead(id: string) {
    return this.request(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  }

  async markAllNotificationsRead() {
    return this.request('/notifications/read-all', {
      method: 'PUT',
    });
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

export const apiService = new ApiService();
export default apiService;
