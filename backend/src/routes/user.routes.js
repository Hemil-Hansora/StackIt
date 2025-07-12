import { Router } from "express";
import { register } from "../controllers/user.controller.js";

const router = Router();

// User registration route
router.route("/register").post(register);

export default router;