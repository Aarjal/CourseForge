const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  enrollInCourse,
  getUserEnrollments,
  checkEnrollment,
} = require("../controllers/enrollmentController");

// All enrollment routes require authentication
router.use(protect);

router.get("/", getUserEnrollments);
router.post("/:courseId", enrollInCourse);
router.get("/:courseId", checkEnrollment);

module.exports = router;
