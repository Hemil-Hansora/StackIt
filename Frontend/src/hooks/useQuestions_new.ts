import { useApp } from '../context/AppContext';
import { Question } from '../lib/types';
import { apiService } from '../lib/api';
import { useState } from 'react';

export function useQuestions() {
  const { state, dispatch } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestions = async (params?: {
    page?: number;
    limit?: number;
    tags?: string;
    search?: string;
    sortBy?: string;
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.getQuestions(params);
      
      if (response.success && (response.data as any).questions) {
        // Convert API questions to frontend format
        const questions: Question[] = (response.data as any).questions.map((q: any) => ({
          id: q._id,
          title: q.title,
          body: q.body,
          excerpt: q.body.substring(0, 200) + '...',
          authorId: q.author._id,
          tags: q.tags || [],
          createdAt: q.createdAt,
          updatedAt: q.updatedAt,
          votes: q.voteCount || 0,
          views: q.viewCount || 0,
          answerCount: q.answerCount || 0,
          acceptedAnswerId: q.acceptedAnswer || null,
        }));

        return {
          questions,
          pagination: (response.data as any).pagination
        };
      }
      
      return { questions: [], pagination: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch questions';
      setError(errorMessage);
      return { questions: [], pagination: null };
    } finally {
      setLoading(false);
    }
  };

  const createQuestion = async (questionData: {
    title: string;
    body: string;
    tags: string[];
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.createQuestion({
        title: questionData.title,
        body: questionData.body,
        tags: questionData.tags
      });

      if (response.success) {
        const newQuestion: Question = {
          id: (response.data as any)._id,
          title: (response.data as any).title,
          body: (response.data as any).body,
          excerpt: (response.data as any).body.substring(0, 200) + '...',
          authorId: (response.data as any).author._id,
          tags: (response.data as any).tags || [],
          createdAt: (response.data as any).createdAt,
          updatedAt: (response.data as any).updatedAt,
          votes: (response.data as any).voteCount || 0,
          views: (response.data as any).viewCount || 0,
          answerCount: (response.data as any).answerCount || 0,
          acceptedAnswerId: (response.data as any).acceptedAnswer || null,
        };

        dispatch({ type: 'ADD_QUESTION', payload: newQuestion });
        return newQuestion;
      }
      
      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create question';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getQuestionById = async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.getQuestionById(id);
      
      if (response.success) {
        const question: Question = {
          id: (response.data as any)._id,
          title: (response.data as any).title,
          body: (response.data as any).body,
          excerpt: (response.data as any).body.substring(0, 200) + '...',
          authorId: (response.data as any).author._id,
          tags: (response.data as any).tags || [],
          createdAt: (response.data as any).createdAt,
          updatedAt: (response.data as any).updatedAt,
          votes: (response.data as any).voteCount || 0,
          views: (response.data as any).viewCount || 0,
          answerCount: (response.data as any).answerCount || 0,
          acceptedAnswerId: (response.data as any).acceptedAnswer || null,
        };

        return question;
      }
      
      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch question';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const voteOnQuestion = async (questionId: string, voteType: 'up' | 'down') => {
    try {
      await apiService.vote(questionId, 'question', voteType);
      // Optionally refetch the question to get updated vote count
    } catch (err) {
      console.error('Failed to vote:', err);
    }
  };

  // Legacy function names for backward compatibility
  const addQuestion = createQuestion;
  const askQuestion = createQuestion;

  return {
    questions: state.questions,
    loading,
    error,
    fetchQuestions,
    createQuestion,
    getQuestionById,
    voteOnQuestion,
    // Legacy functions for existing components
    addQuestion,
    askQuestion,
  };
}
