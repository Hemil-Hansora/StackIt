import express from "express";
import {
  toggleUserBan,
  deleteQuestionByAdmin,
  deleteAnswerByAdmin,
  sendAnnouncement,
  getPlatformStats,
} from "../controllers/admin.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/error.middlewares.js";

const router = express.Router();

router.use(verifyJWT, isAdmin); // restrict all routes to admin only

router.put("/user/:userId/toggle-ban", toggleUserBan);
router.delete("/question/:questionId", deleteQuestionByAdmin);
router.delete("/answer/:answerId", deleteAnswerByAdmin);
router.post("/announcement", sendAnnouncement);
router.get("/stats", getPlatformStats);

export default router;
