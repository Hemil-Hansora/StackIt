import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { Question } from "../models/Question.model.js";
import { Answer } from "../models/Answer.model.js";

// 🔒 Ban or Unban User
export const toggleUserBan = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  user.isBanned = !user.isBanned;
  await user.save();

  res.status(200).json(
    new ApiResponse(200, { userId, isBanned: user.isBanned }, "User ban status updated")
  );
});

// 🚫 Remove inappropriate questions
export const deleteQuestionByAdmin = asyncHandler(async (req, res) => {
  const { questionId } = req.params;
  const question = await Question.findById(questionId);
  if (!question) throw new ApiError(404, "Question not found");

  await Question.findByIdAndDelete(questionId);
  await Answer.deleteMany({ questionId });

  res.status(200).json(new ApiResponse(200, {}, "Question and related answers deleted"));
});

// 🚫 Remove inappropriate answers
export const deleteAnswerByAdmin = asyncHandler(async (req, res) => {
  const { answerId } = req.params;
  const answer = await Answer.findById(answerId);
  if (!answer) throw new ApiError(404, "Answer not found");

  await Answer.findByIdAndDelete(answerId);

  res.status(200).json(new ApiResponse(200, {}, "Answer deleted by admin"));
});

// 📢 Send Announcement (to be expanded to notification/email)
export const sendAnnouncement = asyncHandler(async (req, res) => {
  const { message } = req.body;

  if (!message || message.trim() === "") throw new ApiError(400, "Message required");

  // Future: Save to Announcement model or emit via socket
  res.status(200).json(new ApiResponse(200, { message }, "Announcement sent"));
});

// 📊 Get Basic Platform Stats
export const getPlatformStats = asyncHandler(async (req, res) => {
  const users = await User.countDocuments();
  const bannedUsers = await User.countDocuments({ isBanned: true });
  const questions = await Question.countDocuments();
  const answers = await Answer.countDocuments();

  res.status(200).json(
    new ApiResponse(200, {
      users,
      bannedUsers,
      questions,
      answers
    }, "Platform stats retrieved")
  );
});
