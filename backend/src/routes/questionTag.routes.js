import express from 'express';
import {
  addTagsToQuestion,
  removeTagsFromQuestion,
  getQuestionTags,
  getQuestionsByTag,
  replaceQuestionTags,
  getQuestionsByMultipleTags,
  getTagStatistics
} from '../controllers/questionTagController.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Public routes
// GET /api/questions/:questionId/tags - Get all tags for a specific question
router.get('/questions/:questionId/tags', getQuestionTags);

// GET /api/tags/:tagId/questions - Get all questions with a specific tag
router.get('/tags/:tagId/questions', getQuestionsByTag);

// GET /api/questions/tags/search - Get questions by multiple tags (AND/OR logic)
router.get('/questions/tags/search', getQuestionsByMultipleTags);

// GET /api/tags/statistics - Get tag statistics
router.get('/tags/statistics', getTagStatistics);

// Private routes (require authentication)
// POST /api/questions/:questionId/tags - Add tags to a question
router.use(verifyJWT)
router.post('/questions/:questionId/tags', addTagsToQuestion);

// DELETE /api/questions/:questionId/tags - Remove tags from a question
router.delete('/questions/:questionId/tags', removeTagsFromQuestion);

// PUT /api/questions/:questionId/tags - Replace all tags for a question
router.put('/questions/:questionId/tags', replaceQuestionTags);

export default router;