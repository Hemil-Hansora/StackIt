import QuestionTag from '../models/QuestionTag.js';
import Question from '../models/Question.js';
import Tag from '../models/Tag.js';
import mongoose from 'mongoose';
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// @desc    Add tags to a question
// @route   POST /api/questions/:questionId/tags
// @access  Private (question owner only)
export const addTagsToQuestion = asyncHandler(async (req, res) => {
  const { questionId } = req.params;
  const { tagIds } = req.body; // Array of tag IDs
  const userId = req.user.id;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(questionId)) {
    throw new ApiError(400, 'Invalid question ID format');
  }

  // Validate tagIds array
  if (!Array.isArray(tagIds) || tagIds.length === 0) {
    throw new ApiError(400, 'Tag IDs array is required and cannot be empty');
  }

  // Validate all tag IDs
  for (const tagId of tagIds) {
    if (!mongoose.Types.ObjectId.isValid(tagId)) {
      throw new ApiError(400, `Invalid tag ID format: ${tagId}`);
    }
  }

  // Check if question exists and user owns it
  const question = await Question.findById(questionId);
  if (!question) {
    throw new ApiError(404, 'Question not found');
  }

  if (question.userId.toString() !== userId) {
    throw new ApiError(403, 'You can only add tags to your own questions');
  }

  // Verify all tags exist
  const existingTags = await Tag.find({ _id: { $in: tagIds } });
  if (existingTags.length !== tagIds.length) {
    throw new ApiError(400, 'One or more tags do not exist');
  }

  // Check for existing question-tag relationships
  const existingRelationships = await QuestionTag.find({
    questionId,
    tagId: { $in: tagIds }
  });

  const existingTagIds = existingRelationships.map(rel => rel.tagId.toString());
  const newTagIds = tagIds.filter(tagId => !existingTagIds.includes(tagId));

  if (newTagIds.length === 0) {
    throw new ApiError(400, 'All specified tags are already associated with this question');
  }

  // Create new question-tag relationships
  const newRelationships = newTagIds.map(tagId => ({
    questionId,
    tagId
  }));

  await QuestionTag.insertMany(newRelationships);

  // Get updated question with tags
  const updatedQuestion = await getQuestionWithTags(questionId);

  res.status(201).json(
    new ApiResponse(201, updatedQuestion, 'Tags added to question successfully')
  );
});

// @desc    Remove tags from a question
// @route   DELETE /api/questions/:questionId/tags
// @access  Private (question owner only)
export const removeTagsFromQuestion = asyncHandler(async (req, res) => {
  const { questionId } = req.params;
  const { tagIds } = req.body; // Array of tag IDs to remove
  const userId = req.user.id;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(questionId)) {
    throw new ApiError(400, 'Invalid question ID format');
  }

  // Validate tagIds array
  if (!Array.isArray(tagIds) || tagIds.length === 0) {
    throw new ApiError(400, 'Tag IDs array is required and cannot be empty');
  }

  // Validate all tag IDs
  for (const tagId of tagIds) {
    if (!mongoose.Types.ObjectId.isValid(tagId)) {
      throw new ApiError(400, `Invalid tag ID format: ${tagId}`);
    }
  }

  // Check if question exists and user owns it
  const question = await Question.findById(questionId);
  if (!question) {
    throw new ApiError(404, 'Question not found');
  }

  if (question.userId.toString() !== userId) {
    throw new ApiError(403, 'You can only remove tags from your own questions');
  }

  // Remove question-tag relationships
  const deleteResult = await QuestionTag.deleteMany({
    questionId,
    tagId: { $in: tagIds }
  });

  if (deleteResult.deletedCount === 0) {
    throw new ApiError(400, 'No matching tags found to remove');
  }

  // Get updated question with tags
  const updatedQuestion = await getQuestionWithTags(questionId);

  res.status(200).json(
    new ApiResponse(200, updatedQuestion, `${deleteResult.deletedCount} tag(s) removed from question`)
  );
});

// @desc    Get all tags for a specific question
// @route   GET /api/questions/:questionId/tags
// @access  Public
export const getQuestionTags = asyncHandler(async (req, res) => {
  const { questionId } = req.params;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(questionId)) {
    throw new ApiError(400, 'Invalid question ID format');
  }

  // Check if question exists
  const question = await Question.findById(questionId);
  if (!question) {
    throw new ApiError(404, 'Question not found');
  }

  // Get all tags for this question
  const questionTags = await QuestionTag.find({ questionId })
    .populate('tagId', 'name description color')
    .sort({ createdAt: 1 });

  const tags = questionTags.map(qt => qt.tagId);

  res.status(200).json(
    new ApiResponse(200, { question, tags }, 'Question tags retrieved successfully')
  );
});

// @desc    Get all questions with a specific tag
// @route   GET /api/tags/:tagId/questions
// @access  Public
export const getQuestionsByTag = asyncHandler(async (req, res) => {
  const { tagId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(tagId)) {
    throw new ApiError(400, 'Invalid tag ID format');
  }

  // Check if tag exists
  const tag = await Tag.findById(tagId);
  if (!tag) {
    throw new ApiError(404, 'Tag not found');
  }

  // Get all questions with this tag
  const questionTags = await QuestionTag.find({ tagId })
    .populate({
      path: 'questionId',
      populate: {
        path: 'userId',
        select: 'username email'
      }
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const questions = questionTags.map(qt => qt.questionId);

  // Get total count for pagination
  const totalQuestions = await QuestionTag.countDocuments({ tagId });
  const totalPages = Math.ceil(totalQuestions / limit);

  res.status(200).json(
    new ApiResponse(200, {
      tag,
      questions,
      pagination: {
        currentPage: page,
        totalPages,
        totalQuestions,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }, 'Questions with tag retrieved successfully')
  );
});

// @desc    Replace all tags for a question
// @route   PUT /api/questions/:questionId/tags
// @access  Private (question owner only)
export const replaceQuestionTags = asyncHandler(async (req, res) => {
  const { questionId } = req.params;
  const { tagIds } = req.body; // Array of tag IDs
  const userId = req.user.id;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(questionId)) {
    throw new ApiError(400, 'Invalid question ID format');
  }

  // Validate tagIds array
  if (!Array.isArray(tagIds)) {
    throw new ApiError(400, 'Tag IDs must be an array');
  }

  // Validate all tag IDs
  for (const tagId of tagIds) {
    if (!mongoose.Types.ObjectId.isValid(tagId)) {
      throw new ApiError(400, `Invalid tag ID format: ${tagId}`);
    }
  }

  // Check if question exists and user owns it
  const question = await Question.findById(questionId);
  if (!question) {
    throw new ApiError(404, 'Question not found');
  }

  if (question.userId.toString() !== userId) {
    throw new ApiError(403, 'You can only modify tags for your own questions');
  }

  // If tagIds is not empty, verify all tags exist
  if (tagIds.length > 0) {
    const existingTags = await Tag.find({ _id: { $in: tagIds } });
    if (existingTags.length !== tagIds.length) {
      throw new ApiError(400, 'One or more tags do not exist');
    }
  }

  // Remove all existing tags for this question
  await QuestionTag.deleteMany({ questionId });

  // Add new tags if any
  if (tagIds.length > 0) {
    const newRelationships = tagIds.map(tagId => ({
      questionId,
      tagId
    }));

    await QuestionTag.insertMany(newRelationships);
  }

  // Get updated question with tags
  const updatedQuestion = await getQuestionWithTags(questionId);

  res.status(200).json(
    new ApiResponse(200, updatedQuestion, 'Question tags updated successfully')
  );
});

// @desc    Get questions by multiple tags (AND/OR logic)
// @route   GET /api/questions/tags/search
// @access  Public
export const getQuestionsByMultipleTags = asyncHandler(async (req, res) => {
  const { tagIds, logic = 'OR' } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Validate tagIds
  if (!tagIds) {
    throw new ApiError(400, 'Tag IDs are required');
  }

  const tagIdArray = Array.isArray(tagIds) ? tagIds : tagIds.split(',');

  // Validate all tag IDs
  for (const tagId of tagIdArray) {
    if (!mongoose.Types.ObjectId.isValid(tagId)) {
      throw new ApiError(400, `Invalid tag ID format: ${tagId}`);
    }
  }

  let questionTags;
  let totalQuestions;

  if (logic.toUpperCase() === 'AND') {
    // Find questions that have ALL specified tags
    const pipeline = [
      { $match: { tagId: { $in: tagIdArray.map(id => new mongoose.Types.ObjectId(id)) } } },
      { $group: { _id: '$questionId', tagCount: { $sum: 1 } } },
      { $match: { tagCount: tagIdArray.length } },
      { $sort: { _id: -1 } },
      { $skip: skip },
      { $limit: limit }
    ];

    const results = await QuestionTag.aggregate(pipeline);
    const questionIds = results.map(r => r._id);

    questionTags = await QuestionTag.find({ questionId: { $in: questionIds } })
      .populate({
        path: 'questionId',
        populate: {
          path: 'userId',
          select: 'username email'
        }
      });

    // Get total count for AND logic
    const countPipeline = [
      { $match: { tagId: { $in: tagIdArray.map(id => new mongoose.Types.ObjectId(id)) } } },
      { $group: { _id: '$questionId', tagCount: { $sum: 1 } } },
      { $match: { tagCount: tagIdArray.length } },
      { $count: 'total' }
    ];

    const countResult = await QuestionTag.aggregate(countPipeline);
    totalQuestions = countResult[0]?.total || 0;
  } else {
    // Find questions that have ANY of the specified tags (OR logic)
    questionTags = await QuestionTag.find({ tagId: { $in: tagIdArray } })
      .populate({
        path: 'questionId',
        populate: {
          path: 'userId',
          select: 'username email'
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    totalQuestions = await QuestionTag.countDocuments({ tagId: { $in: tagIdArray } });
  }

  // Group questions and remove duplicates
  const uniqueQuestions = [];
  const seenQuestionIds = new Set();

  for (const qt of questionTags) {
    const questionId = qt.questionId._id.toString();
    if (!seenQuestionIds.has(questionId)) {
      seenQuestionIds.add(questionId);
      uniqueQuestions.push(qt.questionId);
    }
  }

  const totalPages = Math.ceil(totalQuestions / limit);

  res.status(200).json(
    new ApiResponse(200, {
      questions: uniqueQuestions,
      searchParams: {
        tagIds: tagIdArray,
        logic: logic.toUpperCase()
      },
      pagination: {
        currentPage: page,
        totalPages,
        totalQuestions,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }, `Questions with ${logic.toUpperCase()} tag logic retrieved successfully`)
  );
});

// @desc    Get tag statistics
// @route   GET /api/tags/statistics
// @access  Public
export const getTagStatistics = asyncHandler(async (req, res) => {
  const pipeline = [
    {
      $group: {
        _id: '$tagId',
        questionCount: { $sum: 1 },
        firstUsed: { $min: '$createdAt' },
        lastUsed: { $max: '$createdAt' }
      }
    },
    {
      $lookup: {
        from: 'tags',
        localField: '_id',
        foreignField: '_id',
        as: 'tagInfo'
      }
    },
    {
      $unwind: '$tagInfo'
    },
    {
      $project: {
        _id: 0,
        tagId: '$_id',
        name: '$tagInfo.name',
        description: '$tagInfo.description',
        color: '$tagInfo.color',
        questionCount: 1,
        firstUsed: 1,
        lastUsed: 1
      }
    },
    {
      $sort: { questionCount: -1 }
    }
  ];

  const statistics = await QuestionTag.aggregate(pipeline);

  res.status(200).json(
    new ApiResponse(200, statistics, 'Tag statistics retrieved successfully')
  );
});

// Helper function to get question with populated tags
async function getQuestionWithTags(questionId) {
  const questionTags = await QuestionTag.find({ questionId })
    .populate('tagId', 'name description color');

  const question = await Question.findById(questionId)
    .populate('userId', 'username email');

  const tags = questionTags.map(qt => qt.tagId);

  return {
    ...question.toObject(),
    tags
  };
}