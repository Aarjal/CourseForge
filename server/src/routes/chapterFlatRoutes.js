const express = require("express");
const router = express.Router();
const validate = require("../middleware/validate");
const { protect, authorize } = require("../middleware/auth");
const { updateChapterSchema } = require("../validations/chapterValidation");
const {
  getChapterById,
  updateChapter,
  deleteChapter,
} = require("../controllers/chapterController");

// Public
router.get("/:id", getChapterById);

// Protected — instructor/admin only
router.put(
  "/:id",
  protect,
  authorize("instructor", "admin"),
  validate(updateChapterSchema),
  updateChapter
);
router.delete(
  "/:id",
  protect,
  authorize("instructor", "admin"),
  deleteChapter
);

module.exports = router;
