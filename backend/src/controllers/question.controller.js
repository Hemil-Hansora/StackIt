import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import Question from "../models/Question.model";
import { Answer } from "../models";

export const createQuestion = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const userId = req.user.id; // Assuming user is attached to req via auth middleware

  // Validation
  if (!title || !description) {
    throw new ApiError(400, "Title and description are required");
  }

  // Create question
  const question = await Question.create({
    title,
    description,
    userId,
  });

  if (!question) {
    throw new ApiError(200, "Smthing wrong while creating question");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, question, "Question created successfully"));
});

export const getQuestions = asyncHandler(async (req, res) => {
  
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build query object
    const query = {};
    
    // Search functionality
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }
    
    // Filter by user
    if (req.query.userId) {
      query.userId = req.query.userId;
    }

    // Sort options
    let sortOptions = { createdAt: -1 }; // Default: newest first
    
    if (req.query.sort === 'oldest') {
      sortOptions = { createdAt: 1 };
    } else if (req.query.sort === 'title') {
      sortOptions = { title: 1 };
    }

    // Execute query
    const questions = await Question.find(query)
      .populate('userId', 'username email')
      .populate('acceptedAnswerId')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const totalQuestions = await Question.countDocuments(query);
    const totalPages = Math.ceil(totalQuestions / limit);

    res.status(200).json({
      success: true,
      data: {
        questions,
        pagination: {
          currentPage: page,
          totalPages,
          totalQuestions,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    }); 
});

// @desc    Get a single question by ID with answers
// @route   GET /api/questions/:id
// @access  Public
export const getQuestionById = asyncHandler( async (req, res) => {
  
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid question ID format'
      });
    }

    // Find question and populate related data
    const question = await Question.findById(id)
      .populate('userId', 'username email')
      .populate('acceptedAnswerId');

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Get all answers for this question (assuming Answer model exists)
    const answers = await Answer.find({ questionId: id })
      .populate('userId', 'username email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        question,
        answers
      }
    });

});

// @desc    Update a question
// @route   PUT /api/questions/:id
// @access  Private (question owner only)
export const updateQuestion =asyncHandler( async (req, res) => {
  
    const { id } = req.params;
    const { title, description } = req.body;
    const userId = req.user.id;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid question ID format'
      });
    }

    // Find question
    const question = await Question.findById(id);
    
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Check if user owns this question
    if (question.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own questions'
      });
    }

    // Update fields
    if (title) question.title = title;
    if (description) question.description = description;

    await question.save();

    // Populate user info
    await question.populate('userId', 'username email');

    res.status(200).json({
      success: true,
      data: question,
      message: 'Question updated successfully'
    });

});

// @desc    Delete a question
// @route   DELETE /api/questions/:id
// @access  Private (question owner or admin)
export const deleteQuestion = asyncHandler( async (req, res) => {

    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role; // Assuming role is available

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid question ID format'
      });
    }

    // Find question
    const question = await Question.findById(id);
    
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Check permissions (owner or admin)
    if (question.userId.toString() !== userId && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own questions'
      });
    }

    // Delete question
    await Question.findByIdAndDelete(id);

    // Optionally delete associated answers
    await Answer.deleteMany({ questionId: id });

    res.status(200).json({
      success: true,
      message: 'Question deleted successfully'
    });

  
});

// @desc    Accept an answer for a question
// @route   PUT /api/questions/:id/accept/:answerId
// @access  Private (question owner only)
export const acceptAnswer =  asyncHandler( async (req, res) => {
  
    const { id, answerId } = req.params;
    const userId = req.user.id;

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(answerId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format'
      });
    }

    // Find question
    const question = await Question.findById(id);
    
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Check if user owns this question
    if (question.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only question owner can accept answers'
      });
    }

    // Verify answer exists and belongs to this question
    const answer = await Answer.findOne({ _id: answerId, questionId: id });
    
    if (!answer) {
      return res.status(404).json({
        success: false,
        message: 'Answer not found for this question'
      });
    }

    // Update accepted answer
    question.acceptedAnswerId = answerId;
    await question.save();

    res.status(200).json({
      success: true,
      data: question,
      message: 'Answer accepted successfully'
    });

  });

// @desc    Get questions by user
// @route   GET /api/questions/user/:userId
// @access  Public
export const getQuestionsByUser = asyncHandler( async (req, res) => {
  
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    // Find questions by user
    const questions = await Question.find({ userId })
      .populate('userId', 'username email')
      .populate('acceptedAnswerId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalQuestions = await Question.countDocuments({ userId });
    const totalPages = Math.ceil(totalQuestions / limit);

    res.status(200).json({
      success: true,
      data: {
        questions,
        pagination: {
          currentPage: page,
          totalPages,
          totalQuestions,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });


});

// @desc    Search questions
// @route   GET /api/questions/search
// @access  Public
export const searchQuestions = asyncHandler(async (req, res) => {
  
    const { q } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    if (!q || q.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    // Text search
    const questions = await Question.find({
      $text: { $search: q }
    })
    .populate('userId', 'username email')
    .populate('acceptedAnswerId')
    .sort({ score: { $meta: 'textScore' } }) // Sort by relevance
    .skip(skip)
    .limit(limit);

    const totalQuestions = await Question.countDocuments({
      $text: { $search: q }
    });

    const totalPages = Math.ceil(totalQuestions / limit);

    res.status(200).json({
      success: true,
      data: {
        questions,
        searchQuery: q,
        pagination: {
          currentPage: page,
          totalPages,
          totalQuestions,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });
});
