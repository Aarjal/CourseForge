const express = require("express");
const router = express.Router();
const validate = require("../middleware/validate");
const { updateChapterSchema } = require("../validations/chapterValidation");
const {
  getChapterById,
  updateChapter,
  deleteChapter,
} = require("../controllers/chapterController");

router.get("/:id", getChapterById);
router.put("/:id", validate(updateChapterSchema), updateChapter);
router.delete("/:id", deleteChapter);

module.exports = router;
