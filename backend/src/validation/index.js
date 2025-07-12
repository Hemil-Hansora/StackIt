import { z } from "zod";

export const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username must be at most 20 characters")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores"
      ),

    email: z.string().email("Invalid email address"),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(64, "Password must be at most 64 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
        "Password must include at least 1 uppercase letter, 1 lowercase letter, and 1 number"
      ),
    role : z.enum(["USER", "ADMIN"]).default("USER")
  });

  export const loginSchema = z.object({
  email: z
    .string()
    .email("Invalid email address"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters"),
});


export const createQuestionSchema = z.object({
  title: z
    .string()
    .min(10, "Title must be at least 10 characters")
    .max(200, "Title cannot exceed 200 characters")
    .trim(),

  description: z.union([
    z.string().min(1, "Description is required"), // for HTML-based editors
    z.record(z.any()) // for JSON-based editors (like TipTap, Slate)
  ]),

  tags: z.array(z.string()).min(1, "At least one tag is required"), // optional if you handle tags separately
});