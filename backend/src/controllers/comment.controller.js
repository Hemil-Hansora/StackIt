import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import Comment from "../models/Comment.model.js";
import Answer from "../models/Answer.model.js";
import mongoose from "mongoose";

// Create a new comment on an answer
const createComment = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const { answerId } = req.params;
    const userId = req.user._id;

    // Validate required fields
    if (!content || content.trim() === "") {
        throw new ApiError(400, "Comment content is required");
    }

    // Validate answerId format
    if (!mongoose.Types.ObjectId.isValid(answerId)) {
        throw new ApiError(400, "Invalid answer ID format");
    }

    // Check if the answer exists
    const answer = await Answer.findById(answerId);
    if (!answer) {
        throw new ApiError(404, "Answer not found");
    }

    // Create the comment
    const comment = await Comment.create({
        content: content.trim(),
        userId,
        answerId
    });

    // Populate user details in the created comment
    const populatedComment = await Comment.findById(comment._id)
        .populate('userId', 'username email')
        .populate('answerId', 'content questionId');

    return res.status(201).json(
        new ApiResponse(201, populatedComment, "Comment created successfully")
    );
});

// Get all comments for a specific answer
const getCommentsByAnswer = asyncHandler(async (req, res) => {
    const { answerId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Validate answerId format
    if (!mongoose.Types.ObjectId.isValid(answerId)) {
        throw new ApiError(400, "Invalid answer ID format");
    }

    // Check if the answer exists
    const answer = await Answer.findById(answerId);
    if (!answer) {
        throw new ApiError(404, "Answer not found");
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get comments with pagination
    const comments = await Comment.find({ answerId })
        .populate('userId', 'username email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    // Get total count for pagination info
    const totalComments = await Comment.countDocuments({ answerId });

    const paginationInfo = {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalComments / parseInt(limit)),
        totalComments,
        hasNextPage: skip + comments.length < totalComments,
        hasPrevPage: parseInt(page) > 1
    };

    return res.status(200).json(
        new ApiResponse(200, {
            comments,
            pagination: paginationInfo
        }, "Comments retrieved successfully")
    );
});

// Get a specific comment by ID
const getCommentById = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    // Validate commentId format
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "Invalid comment ID format");
    }

    const comment = await Comment.findById(commentId)
        .populate('userId', 'username email')
        .populate('answerId', 'content questionId');

    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    return res.status(200).json(
        new ApiResponse(200, comment, "Comment retrieved successfully")
    );
});

// Update a comment (only by the comment author or admin)
const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;
    const userRole = req.user.role;

    // Validate commentId format
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "Invalid comment ID format");
    }

    // Validate content
    if (!content || content.trim() === "") {
        throw new ApiError(400, "Comment content is required");
    }

    // Find the comment
    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    // Check if user is authorized to update (comment author or admin)
    if (comment.userId.toString() !== userId.toString() && userRole !== 'ADMIN') {
        throw new ApiError(403, "You are not authorized to update this comment");
    }

    // Update the comment
    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        { content: content.trim() },
        { new: true, runValidators: true }
    ).populate('userId', 'username email')
     .populate('answerId', 'content questionId');

    return res.status(200).json(
        new ApiResponse(200, updatedComment, "Comment updated successfully")
    );
});

// Delete a comment (only by the comment author or admin)
const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    // Validate commentId format
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "Invalid comment ID format");
    }

    // Find the comment
    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    // Check if user is authorized to delete (comment author or admin)
    if (comment.userId.toString() !== userId.toString() && userRole !== 'ADMIN') {
        throw new ApiError(403, "You are not authorized to delete this comment");
    }

    // Delete the comment
    await Comment.findByIdAndDelete(commentId);

    return res.status(200).json(
        new ApiResponse(200, {}, "Comment deleted successfully")
    );
});

// Get all comments by a specific user (useful for user profiles)
const getCommentsByUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Validate userId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, "Invalid user ID format");
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get comments with pagination
    const comments = await Comment.find({ userId })
        .populate('userId', 'username email')
        .populate('answerId', 'content questionId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    // Get total count for pagination info
    const totalComments = await Comment.countDocuments({ userId });

    const paginationInfo = {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalComments / parseInt(limit)),
        totalComments,
        hasNextPage: skip + comments.length < totalComments,
        hasPrevPage: parseInt(page) > 1
    };

    return res.status(200).json(
        new ApiResponse(200, {
            comments,
            pagination: paginationInfo
        }, "User comments retrieved successfully")
    );
});

export {
    createComment,
    getCommentsByAnswer,
    getCommentById,
    updateComment,
    deleteComment,
    getCommentsByUser
};