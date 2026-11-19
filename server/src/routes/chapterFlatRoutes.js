const express = require("express");
const router = express.Router();
const validate = require("../middleware/validate");
const { protect, authorize, optionalProtect } = require("../middleware/auth");
const { updateChapterSchema } = require("../validations/chapterValidation");
const {
  getChapterById,
  updateChapter,
  deleteChapter,
} = require("../controllers/chapterController");

// Public endpoint, but optionalProtect allows checking enrollment for non-preview chapters
router.get("/:id", optionalProtect, getChapterById);

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
