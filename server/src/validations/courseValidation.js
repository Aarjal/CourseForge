const { z } = require("zod");

const createCourseSchema = {
  body: z.object({
    title: z.string({ required_error: "Course title is required" }).min(3).max(150),
    description: z.string({ required_error: "Course description is required" }).min(5),
    category: z.string({ required_error: "Course category is required" }).min(2),
    level: z.enum(["Beginner", "Intermediate", "Advanced"], {
      errorMap: () => ({ message: "Level must be Beginner, Intermediate, or Advanced" }),
    }),
    published: z.boolean().optional(),
    price: z.number().nonnegative().optional(),
    thumbnail: z.string().optional(),
  }),
};

const updateCourseSchema = {
  body: z.object({
    title: z.string().min(3).max(150).optional(),
    description: z.string().min(5).optional(),
    category: z.string().min(2).optional(),
    level: z.enum(["Beginner", "Intermediate", "Advanced"]).optional(),
    published: z.boolean().optional(),
    price: z.number().nonnegative().optional(),
    thumbnail: z.string().optional(),
  }),
};

module.exports = {
  createCourseSchema,
  updateCourseSchema,
};
