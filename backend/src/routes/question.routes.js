import express from 'express';
import {
    createQuestion,
    getQuestions,
    getQuestionById,
    updateQuestion,
    deleteQuestion,
    acceptAnswer,
    getQuestionsByUser,
    searchQuestions
} from '../controllers/questionController.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';


const router = express.Router();

// Public routes (no authentication required)
// Get all questions with filtering and pagination
router.get('/', getQuestions);

// Search questions
router.get('/search', searchQuestions);

// Get questions by a specific user
router.get('/user/:userId', getQuestionsByUser);

// Get a specific question by ID with answers
router.get('/:id', getQuestionById);

// Protected routes (authentication required)
router.use(verifyJWT);

// Create a new question
router.post('/', createQuestion);

// Update a question (only by the question owner)
router.put('/:id', updateQuestion);

// Delete a question (only by the question owner or admin)
router.delete('/:id', deleteQuestion);

// Accept an answer for a question (only by the question owner)
router.put('/:id/accept/:answerId', acceptAnswer);

export default router;