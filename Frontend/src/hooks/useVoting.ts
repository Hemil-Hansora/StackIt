import { useApp } from '../context/AppContext';
import { Vote } from '../lib/types';

export function useVoting() {
  const { state, dispatch } = useApp();

  const vote = (targetId: string, targetType: 'question' | 'answer', voteType: 'up' | 'down') => {
    if (!state.currentUser) return;

    const newVote: Vote = {
      id: Date.now().toString(),
      userId: state.currentUser.id,
      targetId,
      targetType,
      type: voteType
    };

    dispatch({ type: 'VOTE', payload: newVote });

    // Update author reputation
    let authorId: string | undefined;
    
    if (targetType === 'question') {
      const question = state.questions.find(q => q.id === targetId);
      authorId = question?.authorId;
    } else {
      const answer = state.answers.find(a => a.id === targetId);
      authorId = answer?.authorId;
    }

    if (authorId && authorId !== state.currentUser.id) {
      const author = state.users.find(u => u.id === authorId);
      if (author) {
        const reputationChange = voteType === 'up' ? 10 : -2;
        const newReputation = Math.max(0, author.reputation + reputationChange);
        
        dispatch({
          type: 'UPDATE_USER',
          payload: { id: authorId, reputation: newReputation }
        });

        // Check for badge awards
        if (newReputation >= 50 && !author.badges.some(b => b.name === '50 Upvotes')) {
          const badge = state.badges.find(b => b.name === '50 Upvotes');
          if (badge) {
            dispatch({ type: 'AWARD_BADGE', payload: { userId: authorId, badge } });
          }
        }

        if (newReputation >= 100 && !author.badges.some(b => b.name === '100 Upvotes')) {
          const badge = state.badges.find(b => b.name === '100 Upvotes');
          if (badge) {
            dispatch({ type: 'AWARD_BADGE', payload: { userId: authorId, badge } });
          }
        }

        // Create notification for upvotes
        if (voteType === 'up') {
          dispatch({
            type: 'ADD_NOTIFICATION',
            payload: {
              id: Date.now().toString(),
              userId: authorId,
              type: 'vote',
              title: `Your ${targetType} was upvoted`,
              message: `Someone upvoted your ${targetType}`,
              relatedId: targetId,
              isRead: false,
              createdAt: new Date().toISOString()
            }
          });
        }
      }
    }
  };

  const getUserVote = (targetId: string): Vote | undefined => {
    if (!state.currentUser) return undefined;
    
    return state.votes.find(v => 
      v.userId === state.currentUser!.id && v.targetId === targetId
    );
  };

  return {
    vote,
    getUserVote,
    votes: state.votes
  };
}