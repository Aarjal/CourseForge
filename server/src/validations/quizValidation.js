const { z } = require("zod");

const createQuizSchema = {
  body: z.object({
    title: z.string({ required_error: "Quiz title is required" }).min(2).max(150),
    description: z.string().optional(),
    passingScore: z.coerce.number().min(1).max(100).optional(),
    questions: z
      .array(
        z.object({
          question: z.string({ required_error: "Question text is required" }).min(3),
          options: z.array(z.string().min(1)).min(2, "Must provide at least 2 options"),
          correctAnswer: z.coerce.number().int().nonnegative("Correct answer must be a valid option index"),
          explanation: z.string().optional(),
        })
      )
      .min(1, "Quiz must contain at least one question"),
  }),
};

const updateQuizSchema = {
  body: z.object({
    title: z.string().min(2).max(150).optional(),
    description: z.string().optional(),
    passingScore: z.coerce.number().min(1).max(100).optional(),
    questions: z
      .array(
        z.object({
          question: z.string().min(3),
          options: z.array(z.string().min(1)).min(2, "Must provide at least 2 options"),
          correctAnswer: z.coerce.number().int().nonnegative(),
          explanation: z.string().optional(),
        })
      )
      .min(1)
      .optional(),
  }),
};

const submitQuizSchema = {
  body: z.object({
    answers: z.union([
      z.array(z.coerce.number().int().nonnegative()),
      z.record(z.string(), z.coerce.number().int().nonnegative()),
    ]),
  }),
};

module.exports = {
  createQuizSchema,
  updateQuizSchema,
  submitQuizSchema,
};
