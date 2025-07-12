import User from "../models/user.model.js";
import Answer from "../models/Answer.model.js";
import Question from "../models/Question.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Create a new answer for a specific question
const createAnswer = asyncHandler(async (req, res) => {
    const { questionId } = req.params;
    const { content } = req.body;
    const userId = req.user._id; // Assuming user is authenticated

    // Validate input
    if (!content || (typeof content === 'string' && content.trim() === '')) {
        throw new ApiError(400, "Answer content is required");
    }

    // Check if question exists
    const question = await Question.findById(questionId);
    if (!question) {
        throw new ApiError(404, "Question not found");
    }

    // Create new answer
    const answer = await Answer.create({
        content,
        questionId,
        userId,
        isAccepted: false
    });

    // Populate user details for response
    const populatedAnswer = await Answer.findById(answer._id)
        .populate('userId', 'username email')
        .populate('questionId', 'title description');

    res.status(201).json(
        new ApiResponse(201, populatedAnswer, "Answer created successfully")
    );
});

// Get all answers for a specific question
const getAnswersByQuestion = asyncHandler(async (req, res) => {
    const { questionId } = req.params;
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    // Check if question exists
    const question = await Question.findById(questionId);
    if (!question) {
        throw new ApiError(404, "Question not found");
    }

    const skip = (page - 1) * limit;
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get answers with pagination
    const answers = await Answer.find({ questionId })
        .populate('userId', 'username email')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit));

    // Get total count for pagination
    const totalAnswers = await Answer.countDocuments({ questionId });

    const pagination = {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalAnswers / limit),
        totalAnswers,
        hasNextPage: page < Math.ceil(totalAnswers / limit),
        hasPrevPage: page > 1
    };

    res.status(200).json(
        new ApiResponse(200, { answers, pagination }, "Answers retrieved successfully")
    );
});

// Get a specific answer by ID
const getAnswerById = asyncHandler(async (req, res) => {
    const { answerId } = req.params;

    const answer = await Answer.findById(answerId)
        .populate('userId', 'username email')
        .populate('questionId', 'title description');

    if (!answer) {
        throw new ApiError(404, "Answer not found");
    }

    res.status(200).json(
        new ApiResponse(200, answer, "Answer retrieved successfully")
    );
});


// Delete an answer (only by the author)
const deleteAnswer = asyncHandler(async (req, res) => {
    const { answerId } = req.params;
    const userId = req.user._id;

    // Find the answer
    const answer = await Answer.findById(answerId);
    if (!answer) {
        throw new ApiError(404, "Answer not found");
    }

    // Check if user is the author of the answer
    if (answer.userId.toString() !== userId.toString()) {
        throw new ApiError(403, "You can only delete your own answers");
    }

    // If this answer is accepted, update the question to remove acceptedAnswerId
    if (answer.isAccepted) {
        await Question.findByIdAndUpdate(
            answer.questionId,
            { acceptedAnswerId: null }
        );
    }

    // Delete the answer
    await Answer.findByIdAndDelete(answerId);

    res.status(200).json(
        new ApiResponse(200, {}, "Answer deleted successfully")
    );
});

// Accept an answer (only by the question author)
const acceptAnswer = asyncHandler(async (req, res) => {
    const { answerId } = req.params;
    const userId = req.user._id;

    // Find the answer with populated question
    const answer = await Answer.findById(answerId).populate('questionId');
    if (!answer) {
        throw new ApiError(404, "Answer not found");
    }

    // Check if user is the author of the question
    if (answer.questionId.userId.toString() !== userId.toString()) {
        throw new ApiError(403, "Only the question author can accept answers");
    }

    // Check if answer is already accepted
    if (answer.isAccepted) {
        throw new ApiError(400, "Answer is already accepted");
    }

    // Unaccept all previous accepted answers for this question
    await Answer.updateMany(
        { questionId: answer.questionId._id, isAccepted: true },
        { isAccepted: false }
    );

    // Accept this answer
    answer.isAccepted = true;
    await answer.save();

    // Update the question with acceptedAnswerId
    await Question.findByIdAndUpdate(
        answer.questionId._id,
        { acceptedAnswerId: answerId }
    );

    const updatedAnswer = await Answer.findById(answerId)
        .populate('userId', 'username email')
        .populate('questionId', 'title description');

    res.status(200).json(
        new ApiResponse(200, updatedAnswer, "Answer accepted successfully")
    );
});

// Unaccept an answer (only by the question author)
const unacceptAnswer = asyncHandler(async (req, res) => {
    const { answerId } = req.params;
    const userId = req.user._id;

    // Find the answer with populated question
    const answer = await Answer.findById(answerId).populate('questionId');
    if (!answer) {
        throw new ApiError(404, "Answer not found");
    }

    // Check if user is the author of the question
    if (answer.questionId.userId.toString() !== userId.toString()) {
        throw new ApiError(403, "Only the question author can unaccept answers");
    }

    // Check if answer is currently accepted
    if (!answer.isAccepted) {
        throw new ApiError(400, "Answer is not currently accepted");
    }

    // Unaccept the answer
    answer.isAccepted = false;
    await answer.save();

    // Remove acceptedAnswerId from question
    await Question.findByIdAndUpdate(
        answer.questionId._id,
        { acceptedAnswerId: null }
    );

    const updatedAnswer = await Answer.findById(answerId)
        .populate('userId', 'username email')
        .populate('questionId', 'title description');

    res.status(200).json(
        new ApiResponse(200, updatedAnswer, "Answer unaccepted successfully")
    );
});

// Get answers by a specific user
const getAnswersByUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const skip = (page - 1) * limit;
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get answers by a specific user
    const answers = await Answer.find({ userId })
        .populate('questionId', 'title description')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit));

    // Get total count for pagination
    const totalAnswers = await Answer.countDocuments({ userId });

    const pagination = {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalAnswers / limit),
        totalAnswers,
        hasNextPage: page < Math.ceil(totalAnswers / limit),
        hasPrevPage: page > 1
    };

    res.status(200).json(
        new ApiResponse(200, { answers, pagination }, "User answers retrieved successfully")
    );
});

export {
    createAnswer,
    getAnswersByQuestion,
    getAnswerById,
    deleteAnswer,
    acceptAnswer,
    unacceptAnswer,
    getAnswersByUser
};