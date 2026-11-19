const { z } = require("zod");

const registerSchema = {
  body: z.object({
    name: z
      .string({ required_error: "Name is required" })
      .min(1, "Name cannot be empty")
      .max(100),
    email: z
      .string({ required_error: "Email is required" })
      .email("Please provide a valid email"),
    password: z
      .string({ required_error: "Password is required" })
      .min(6, "Password must be at least 6 characters"),
    role: z.enum(["student", "instructor", "admin"]).optional(),
  }),
};

const loginSchema = {
  body: z.object({
    email: z
      .string({ required_error: "Email is required" })
      .email("Please provide a valid email"),
    password: z
      .string({ required_error: "Password is required" })
      .min(1, "Password is required"),
  }),
};

module.exports = {
  registerSchema,
  loginSchema,
};
