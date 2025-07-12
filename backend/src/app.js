import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { errorMiddleware } from "./middlewares/error.middlewares.js";
import { ApiResponse } from "./utils/apiResponse.js";
import UserRouter from "./routes/user.routes.js";
import QuestionRouter from "./routes/question.routes.js";
import AnswerRouter from "./routes/answer.routes.js";
import VoteRouter from "./routes/vote.route.js";
import TagRouter from "./routes/tag.route.js";
import NotificationRouter from "./routes/notification.route.js";
import AdminRouter from "./routes/admin.routes.js";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "16kb" }));

app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use(cookieParser());

// Routes
app.use("/api/v1/users", UserRouter);
app.use("/api/v1/questions", QuestionRouter);
// app.use("/api/v1/answers", AnswerRouter);
// app.use("/api/v1/votes", VoteRouter);
// app.use("/api/v1/tags", TagRouter);
// app.use("/api/v1/notifications", NotificationRouter);
// app.use("/api/v1/admin", AdminRouter);

// Health check endpoint
app.get("/api/v1/health", (req, res) => {
  res.json(new ApiResponse(200, { status: "OK" }, "Server is running"));
});

app.use(errorMiddleware);
export { app };