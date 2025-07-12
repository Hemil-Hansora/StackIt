import express from 'express';
import {
    createAnswer,
    getAnswersByQuestion,
    getAnswerById,
    deleteAnswer,
    acceptAnswer,
    unacceptAnswer,
    getAnswersByUser
} from '../controllers/answer.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Public routes (no authentication required)
// Get all answers for a specific question
router.get('/question/:questionId', getAnswersByQuestion);

// Get a specific answer by ID
router.get('/:answerId', getAnswerById);

// Get answers by a specific user
router.get('/user/:userId', getAnswersByUser);

// Protected routes (authentication required)
router.use(verifyJWT);

// Create a new answer for a specific question
router.post('/question/:questionId', createAnswer);

// Delete an answer (only by the author)
router.delete('/:answerId', deleteAnswer);

// Accept an answer (only by the question author)
router.put('/:answerId/accept', acceptAnswer);

// Unaccept an answer (only by the question author)
router.put('/:answerId/unaccept', unacceptAnswer);

export default router;