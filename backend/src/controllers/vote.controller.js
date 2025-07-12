import mongoose from 'mongoose';
import Vote from '../models/Vote.model.js';
import Answer from '../models/Answer.model.js';
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// @desc    Upvote an answer
// @route   POST /api/votes/upvote
// @access  Private
const upvoteAnswer = asyncHandler(async (req, res) => {
  const { answerId } = req.body;
  const userId = req.user._id;

  // Check if answer exists
  const answer = await Answer.findById(answerId);
  if (!answer) {
    throw new ApiError(404, 'Answer not found');
  }

  // Check if user is trying to vote on their own answer
  if (answer.userId.toString() === userId.toString()) {
    throw new ApiError(400, 'You cannot upvote your own answer');
  }

  // Check if user has already voted on this answer
  const existingVote = await Vote.findOne({ userId, answerId });

  if (existingVote) {
    // If already upvoted, remove the upvote (toggle off)
    if (existingVote.value === 1) {
      await Vote.findByIdAndDelete(existingVote._id);
      return res.status(200).json(
        new ApiResponse(200, {
          action: 'removed',
          previousVote: 'upvote'
        }, 'Upvote removed successfully')
      );
    } else {
      // Change downvote to upvote
      existingVote.value = 1;
      await existingVote.save();
      return res.status(200).json(
        new ApiResponse(200, {
          action: 'updated',
          vote: existingVote,
          voteType: 'upvote'
        }, 'Changed to upvote successfully')
      );
    }
  } else {
    // Create new upvote
    const newVote = new Vote({
      userId,
      answerId,
      value: 1
    });

    await newVote.save();
    
    return res.status(201).json(
      new ApiResponse(201, {
        action: 'created',
        vote: newVote,
        voteType: 'upvote'
      }, 'Upvote created successfully')
    );
  }
});

// @desc    Downvote an answer
// @route   POST /api/votes/downvote
// @access  Private
const downvoteAnswer = asyncHandler(async (req, res) => {
  const { answerId } = req.body;
  const userId = req.user._id;

  // Check if answer exists
  const answer = await Answer.findById(answerId);
  if (!answer) {
    throw new ApiError(404, 'Answer not found');
  }

  // Check if user is trying to vote on their own answer
  if (answer.userId.toString() === userId.toString()) {
    throw new ApiError(400, 'You cannot downvote your own answer');
  }

  // Check if user has already voted on this answer
  const existingVote = await Vote.findOne({ userId, answerId });

  if (existingVote) {
    // If already downvoted, remove the downvote (toggle off)
    if (existingVote.value === -1) {
      await Vote.findByIdAndDelete(existingVote._id);
      return res.status(200).json(
        new ApiResponse(200, {
          action: 'removed',
          previousVote: 'downvote'
        }, 'Downvote removed successfully')
      );
    } else {
      // Change upvote to downvote
      existingVote.value = -1;
      await existingVote.save();
      return res.status(200).json(
        new ApiResponse(200, {
          action: 'updated',
          vote: existingVote,
          voteType: 'downvote'
        }, 'Changed to downvote successfully')
      );
    }
  } else {
    // Create new downvote
    const newVote = new Vote({
      userId,
      answerId,
      value: -1
    });

    await newVote.save();
    
    return res.status(201).json(
      new ApiResponse(201, {
        action: 'created',
        vote: newVote,
        voteType: 'downvote'
      }, 'Downvote created successfully')
    );
  }
});

// Export all functions at the end

// @desc    Get vote counts for an answer
// @route   GET /api/votes/answer/:answerId
// @access  Public
const getAnswerVoteCounts = asyncHandler(async (req, res) => {
  const { answerId } = req.params;

  // Validate answerId
  if (!mongoose.Types.ObjectId.isValid(answerId)) {
    throw new ApiError(400, 'Invalid answer ID');
  }

  // Check if answer exists
  const answer = await Answer.findById(answerId);
  if (!answer) {
    throw new ApiError(404, 'Answer not found');
  }

  // Get vote counts using aggregation
  const voteStats = await Vote.aggregate([
    { $match: { answerId: new mongoose.Types.ObjectId(answerId) } },
    {
      $group: {
        _id: '$value',
        count: { $sum: 1 }
      }
    }
  ]);

  // Process the results
  let upvotes = 0;
  let downvotes = 0;

  voteStats.forEach(stat => {
    if (stat._id === 1) upvotes = stat.count;
    if (stat._id === -1) downvotes = stat.count;
  });

  const totalVotes = upvotes + downvotes;
  const score = upvotes - downvotes;

  return res.status(200).json(
    new ApiResponse(200, {
      answerId,
      upvotes,
      downvotes,
      totalVotes,
      score
    }, 'Vote counts retrieved successfully')
  );
});

// @desc    Get user's vote on a specific answer
// @route   GET /api/votes/answer/:answerId/user
// @access  Private
const getUserVoteOnAnswer = asyncHandler(async (req, res) => {
  const { answerId } = req.params;
  const userId = req.user._id;

  // Validate answerId
  if (!mongoose.Types.ObjectId.isValid(answerId)) {
    throw new ApiError(400, 'Invalid answer ID');
  }

  // Find user's vote on this answer
  const userVote = await Vote.findOne({ userId, answerId });

  return res.status(200).json(
    new ApiResponse(200, {
      answerId,
      userVote: userVote ? {
        voteType: userVote.voteType,
        value: userVote.value,
        createdAt: userVote.createdAt
      } : null
    }, 'User vote retrieved successfully')
  );
});

// @desc    Get all votes for multiple answers (bulk operation)
// @route   POST /api/votes/bulk
// @access  Public
const getBulkAnswerVotes = asyncHandler(async (req, res) => {
  const { answerIds } = req.body;

  // Validate input
  if (!Array.isArray(answerIds) || answerIds.length === 0) {
    throw new ApiError(400, 'answerIds must be a non-empty array');
  }

  // Validate all answerIds
  const validAnswerIds = answerIds.filter(id => mongoose.Types.ObjectId.isValid(id));
  if (validAnswerIds.length !== answerIds.length) {
    throw new ApiError(400, 'All answer IDs must be valid ObjectIds');
  }

  // Get vote counts for all answers
  const voteStats = await Vote.aggregate([
    { 
      $match: { 
        answerId: { $in: validAnswerIds.map(id => new mongoose.Types.ObjectId(id)) }
      }
    },
    {
      $group: {
        _id: {
          answerId: '$answerId',
          value: '$value'
        },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: '$_id.answerId',
        votes: {
          $push: {
            voteType: { $cond: [{ $eq: ['$_id.value', 1] }, 'upvote', 'downvote'] },
            value: '$_id.value',
            count: '$count'
          }
        }
      }
    }
  ]);

  // Process results to ensure all requested answers are included
  const results = validAnswerIds.map(answerId => {
    const answerStats = voteStats.find(stat => stat._id.toString() === answerId);
    
    let upvotes = 0;
    let downvotes = 0;

    if (answerStats) {
      answerStats.votes.forEach(vote => {
        if (vote.value === 1) upvotes = vote.count;
        if (vote.value === -1) downvotes = vote.count;
      });
    }

    return {
      answerId,
      upvotes,
      downvotes,
      totalVotes: upvotes + downvotes,
      score: upvotes - downvotes
    };
  });

  return res.status(200).json(
    new ApiResponse(200, results, 'Bulk vote counts retrieved successfully')
  );
});

// @desc    Get user's voting history
// @route   GET /api/votes/user/history
// @access  Private
const getUserVotingHistory = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { page = 1, limit = 10, voteType } = req.query;

  // Build query
  const query = { userId };
  if (voteType && ['upvote', 'downvote'].includes(voteType)) {
    query.value = voteType === 'upvote' ? 1 : -1;
  }

  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Get votes with populated answer and question data
  const votes = await Vote.find(query)
    .populate({
      path: 'answerId',
      populate: {
        path: 'questionId',
        select: 'title'
      },
      select: 'content questionId userId'
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  // Get total count for pagination
  const totalVotes = await Vote.countDocuments(query);

  return res.status(200).json(
    new ApiResponse(200, {
      votes,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalVotes / parseInt(limit)),
        totalVotes,
        hasNextPage: skip + votes.length < totalVotes,
        hasPrevPage: parseInt(page) > 1
      }
    }, 'User voting history retrieved successfully')
  );
});

// @desc    Remove a vote
// @route   DELETE /api/votes/:voteId
// @access  Private
const removeVote = asyncHandler(async (req, res) => {
  const { voteId } = req.params;
  const userId = req.user._id;

  // Validate voteId
  if (!mongoose.Types.ObjectId.isValid(voteId)) {
    throw new ApiError(400, 'Invalid vote ID');
  }

  // Find and verify ownership
  const vote = await Vote.findById(voteId);
  if (!vote) {
    throw new ApiError(404, 'Vote not found');
  }

  if (vote.userId.toString() !== userId.toString()) {
    throw new ApiError(403, 'You can only remove your own votes');
  }

  await Vote.findByIdAndDelete(voteId);

  return res.status(200).json(
    new ApiResponse(200, {}, 'Vote removed successfully')
  );
});

export {
  upvoteAnswer,
  downvoteAnswer,
  getAnswerVoteCounts,
  getUserVoteOnAnswer,
  getBulkAnswerVotes,
  getUserVotingHistory,
  removeVote
};
