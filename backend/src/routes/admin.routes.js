import express from "express";
import {
  toggleUserBan,
  deleteQuestionByAdmin,
  deleteAnswerByAdmin,
  sendAnnouncement,
  getPlatformStats,
} from "../controllers/admin.controller.js";
import { authMiddleware, isAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authMiddleware, isAdmin); // restrict all routes to admin only

router.put("/user/:userId/toggle-ban", toggleUserBan);
router.delete("/question/:questionId", deleteQuestionByAdmin);
router.delete("/answer/:answerId", deleteAnswerByAdmin);
router.post("/announcement", sendAnnouncement);
router.get("/stats", getPlatformStats);

export default router;
