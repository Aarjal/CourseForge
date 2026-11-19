const express = require("express");
const router = express.Router({ mergeParams: true });
const validate = require("../middleware/validate");
const {
  createChapterSchema,
  reorderChaptersSchema,
} = require("../validations/chapterValidation");
const {
  getChaptersByCourse,
  createChapter,
  reorderChapters,
} = require("../controllers/chapterController");

router.get("/", getChaptersByCourse);
router.post("/", validate(createChapterSchema), createChapter);
router.patch("/reorder", validate(reorderChaptersSchema), reorderChapters);

module.exports = router;
