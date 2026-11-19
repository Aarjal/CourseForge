const { z } = require("zod");

const createChapterSchema = {
  body: z.object({
    title: z.string({ required_error: "Chapter title is required" }).min(2).max(150),
    duration: z.coerce.number().min(1, "Duration must be at least 1 minute"),
    preview: z.boolean().optional(),
    order: z.coerce.number().int().positive().optional(),
    type: z.enum(["Theory", "Lab", "Video"]).optional(),
    content: z.string().optional(),
  }),
};

const updateChapterSchema = {
  body: z.object({
    title: z.string().min(2).max(150).optional(),
    duration: z.coerce.number().min(1).optional(),
    preview: z.boolean().optional(),
    order: z.coerce.number().int().positive().optional(),
    type: z.enum(["Theory", "Lab", "Video"]).optional(),
    content: z.string().optional(),
  }),
};

const reorderChaptersSchema = {
  body: z.object({
    chapterOrders: z.array(
      z.object({
        id: z.string(),
        order: z.number().int().positive(),
      })
    ).min(1, "At least one chapter order must be provided"),
  }),
};

module.exports = {
  createChapterSchema,
  updateChapterSchema,
  reorderChaptersSchema,
};
