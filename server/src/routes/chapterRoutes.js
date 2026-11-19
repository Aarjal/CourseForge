const express = require("express");
const router = express.Router({ mergeParams: true });
const validate = require("../middleware/validate");
const { protect, authorize } = require("../middleware/auth");
const {
  createChapterSchema,
  reorderChaptersSchema,
} = require("../validations/chapterValidation");
const {
  getChaptersByCourse,
  createChapter,
  reorderChapters,
} = require("../controllers/chapterController");

// Public
router.get("/", getChaptersByCourse);

// Protected — instructor/admin only
router.post(
  "/",
  protect,
  authorize("instructor", "admin"),
  validate(createChapterSchema),
  createChapter
);
router.patch(
  "/reorder",
  protect,
  authorize("instructor", "admin"),
  validate(reorderChaptersSchema),
  reorderChapters
);

module.exports = router;
