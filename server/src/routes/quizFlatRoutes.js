const express = require("express");
const router = express.Router();
const Quiz = require("../models/quiz");
const { optionalProtect, protect } = require("../middleware/auth");
const { submitQuizAttempt } = require("../controllers/quizController");

// Global fallback to get quiz questions
router.get("/", optionalProtect, async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne();
    if (!quiz) {
      return res.status(200).json([]);
    }
    const isPrivileged =
      req.user && (req.user.role === "admin" || req.user.role === "instructor");
    if (isPrivileged) {
      return res.status(200).json(quiz.questions);
    }

    const sanitized = quiz.questions.map((q) => ({
      _id: q._id,
      question: q.question,
      options: q.options,
    }));
    res.status(200).json(sanitized);
  } catch (err) {
    next(err);
  }
});

// Backward-compatible submit
router.post("/submit", protect, async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne();
    if (!quiz) {
      return res.status(404).json({ error: "Not Found", message: "No quiz found" });
    }
    req.params.courseId = quiz.course;
    return submitQuizAttempt(req, res, next);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
