import { Router } from "express";
import { register, login } from "../controllers/user.controller.js";

const router = Router();

// User registration route
router.route("/register").post(register);

// User login route
router.route("/login").post(login);

export default router;