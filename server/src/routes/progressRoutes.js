const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  getUserProgress,
  getCourseProgress,
  completeChapter,
  updateLastAccessed,
} = require("../controllers/progressController");

// All progress routes require authentication
router.use(protect);

router.get("/", getUserProgress);
router.get("/:courseId", getCourseProgress);
router.post("/:courseId/chapters/:chapterId", completeChapter);
router.put("/:courseId/last-accessed/:chapterId", updateLastAccessed);

module.exports = router;
