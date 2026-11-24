const express = require("express");
const router = express.Router({ mergeParams: true });
const validate = require("../middleware/validate");
const { protect, authorize, optionalProtect } = require("../middleware/auth");
const {
  createQuizSchema,
  updateQuizSchema,
  submitQuizSchema,
} = require("../validations/quizValidation");
const {
  getQuizByCourse,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  submitQuizAttempt,
  getQuizAttempts,
} = require("../controllers/quizController");

// View quiz questions for a course (answer keys masked for students)
router.get("/", optionalProtect, getQuizByCourse);

// Instructor/Admin management
router.post(
  "/",
  protect,
  authorize("instructor", "admin"),
  validate(createQuizSchema),
  createQuiz
);
router.put(
  "/",
  protect,
  authorize("instructor", "admin"),
  validate(updateQuizSchema),
  updateQuiz
);
router.delete(
  "/",
  protect,
  authorize("instructor", "admin"),
  deleteQuiz
);

// Submit quiz answers (requires enrollment for students)
router.post(
  "/submit",
  protect,
  validate(submitQuizSchema),
  submitQuizAttempt
);

// Review attempts
router.get("/attempts", protect, getQuizAttempts);

module.exports = router;
