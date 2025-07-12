import { Router } from "express";
<<<<<<< HEAD
import { register, login } from "../controllers/user.controller.js";
=======
import { register } from "../controllers/user.controller.js";
import { login } from "../controllers/user.controller.js";
>>>>>>> de1e6d9c4ef89a0d5aa26440bbdb3a242e91424b

const router = Router();

// User registration route
router.route("/register").post(register);
router.route("/login").post(login);

router.route("/login").post(login);

export default router;