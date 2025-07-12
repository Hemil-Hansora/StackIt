import express from 'express';
import {
    createTag,
    getAllTags,
    getTagById,
    getTagByName,
    updateTag,
    deleteTag
} from '../controllers/tagController.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Public routes (no authentication required)
// Get all tags with pagination and search
router.get('/', getAllTags);

// Get a specific tag by ID
router.get('/:tagId', getTagById);

// Get a specific tag by name
router.get('/name/:tagName', getTagByName);

// Protected routes (authentication required)
router.use(verifyJWT);

// Create a new tag
router.post('/', createTag);

// Update a tag
router.put('/:tagId', updateTag);

// Delete a tag
router.delete('/:tagId', deleteTag);

export default router;