import express from 'express';
import {
    upvoteAnswer,
    downvoteAnswer,
    getAnswerVoteCounts,
    getUserVoteOnAnswer,
    getBulkAnswerVotes,
    getUserVotingHistory,
    removeVote
} from '../controllers/voteController.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Public routes (no authentication required)
// Get vote counts for a specific answer
router.get('/answer/:answerId', getAnswerVoteCounts);

// Get bulk vote counts for multiple answers
router.post('/bulk', getBulkAnswerVotes);

// Protected routes (authentication required)
router.use(verifyJWT);

// Vote on answers
router.post('/upvote', upvoteAnswer);
router.post('/downvote', downvoteAnswer);

// Get user's vote on a specific answer
router.get('/answer/:answerId/user', getUserVoteOnAnswer);

// Get user's voting history
router.get('/user/history', getUserVotingHistory);

// Remove a specific vote
router.delete('/:voteId', removeVote);

export default router;