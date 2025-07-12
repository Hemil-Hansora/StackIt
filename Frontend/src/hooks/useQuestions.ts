import { useApp } from '../context/AppContext';
import { Question, Answer, Comment } from '../lib/types';

export function useQuestions() {
  const { state, dispatch } = useApp();

  const addQuestion = (questionData: Omit<Question, 'id' | 'createdAt' | 'updatedAt' | 'votes' | 'views' | 'answerCount'>) => {
    const newQuestion: Question = {
      ...questionData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      votes: 0,
      views: 0,
      answerCount: 0
    };

    dispatch({ type: 'ADD_QUESTION', payload: newQuestion });
    
    // Award "First Post" badge if this is user's first question
    if (state.currentUser && !state.currentUser.badges.some(b => b.name === 'First Post')) {
      const firstPostBadge = state.badges.find(b => b.name === 'First Post');
      if (firstPostBadge) {
        dispatch({ 
          type: 'AWARD_BADGE', 
          payload: { userId: state.currentUser.id, badge: firstPostBadge } 
        });
      }
    }

    return newQuestion.id;
  };

  const addAnswer = (answerData: Omit<Answer, 'id' | 'createdAt' | 'votes' | 'isAccepted'>) => {
    const newAnswer: Answer = {
      ...answerData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      votes: 0,
      isAccepted: false
    };

    dispatch({ type: 'ADD_ANSWER', payload: newAnswer });

    // Create notification for question author
    const question = state.questions.find(q => q.id === answerData.questionId);
    if (question && question.authorId !== answerData.authorId) {
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: Date.now().toString(),
          userId: question.authorId,
          type: 'answer',
          title: 'New answer on your question',
          message: `Someone answered your question: ${question.title}`,
          relatedId: question.id,
          isRead: false,
          createdAt: new Date().toISOString()
        }
      });
    }

    return newAnswer.id;
  };

  const addComment = (commentData: Omit<Comment, 'id' | 'createdAt'>) => {
    const newComment: Comment = {
      ...commentData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };

    dispatch({ type: 'ADD_COMMENT', payload: newComment });
    return newComment.id;
  };

  const acceptAnswer = (answerId: string, questionId: string) => {
    // Mark all answers for this question as not accepted
    state.answers
      .filter(a => a.questionId === questionId)
      .forEach(answer => {
        dispatch({
          type: 'UPDATE_ANSWER',
          payload: { id: answer.id, isAccepted: false }
        });
      });

    // Mark the selected answer as accepted
    dispatch({
      type: 'UPDATE_ANSWER',
      payload: { id: answerId, isAccepted: true }
    });

    // Update question with accepted answer
    dispatch({
      type: 'UPDATE_QUESTION',
      payload: { id: questionId, acceptedAnswerId: answerId }
    });

    // Award reputation to answer author
    const answer = state.answers.find(a => a.id === answerId);
    if (answer) {
      const author = state.users.find(u => u.id === answer.authorId);
      if (author) {
        dispatch({
          type: 'UPDATE_USER',
          payload: { id: author.id, reputation: author.reputation + 15 }
        });

        // Create notification
        dispatch({
          type: 'ADD_NOTIFICATION',
          payload: {
            id: Date.now().toString(),
            userId: answer.authorId,
            type: 'accepted',
            title: 'Your answer was accepted!',
            message: 'Your answer was marked as the accepted solution',
            relatedId: questionId,
            isRead: false,
            createdAt: new Date().toISOString()
          }
        });
      }
    }
  };

  const incrementViewCount = (questionId: string) => {
    dispatch({ type: 'INCREMENT_VIEW_COUNT', payload: questionId });
  };

  const getFilteredQuestions = () => {
    let filtered = state.questions;

    // Apply search filter
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter(q => 
        q.title.toLowerCase().includes(query) ||
        q.body.toLowerCase().includes(query) ||
        q.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply tag filter
    if (state.selectedTags.length > 0) {
      filtered = filtered.filter(q =>
        state.selectedTags.some(tag => q.tags.includes(tag))
      );
    }

    // Apply sorting
    switch (state.sortBy) {
      case 'votes':
        filtered.sort((a, b) => b.votes - a.votes);
        break;
      case 'unanswered':
        filtered = filtered.filter(q => q.answerCount === 0);
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'trending':
        // Simple trending algorithm: recent questions with high engagement
        filtered.sort((a, b) => {
          const aScore = a.votes + a.answerCount + (a.views / 10);
          const bScore = b.votes + b.answerCount + (b.views / 10);
          return bScore - aScore;
        });
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    return filtered;
  };

  return {
    questions: state.questions,
    answers: state.answers,
    comments: state.comments,
    addQuestion,
    addAnswer,
    addComment,
    acceptAnswer,
    incrementViewCount,
    getFilteredQuestions
  };
}