const Quiz = require("../models/quiz");
const QuizAttempt = require("../models/quizAttempt");
const Course = require("../models/course");
const Enrollment = require("../models/enrollment");
const Progress = require("../models/progress");

/**
 * @route   GET /api/v1/courses/:courseId/quiz
 * @desc    Get the quiz for a course (masks correct answers for students)
 * @access  Public / OptionalAuth
 */
const getQuizByCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: "Not Found", message: "Course not found" });
    }

    const quiz = await Quiz.findOne({ course: courseId });
    if (!quiz) {
      return res.status(404).json({ error: "Not Found", message: "No quiz found for this course" });
    }

    const isPrivileged =
      req.user && (req.user.role === "admin" || req.user.role === "instructor");

    if (isPrivileged) {
      return res.status(200).json(quiz);
    }

    // Mask answer keys and explanations for non-privileged users
    const sanitizedQuestions = quiz.questions.map((q) => ({
      _id: q._id,
      question: q.question,
      options: q.options,
    }));

    res.status(200).json({
      _id: quiz._id,
      course: quiz.course,
      title: quiz.title,
      description: quiz.description,
      passingScore: quiz.passingScore,
      questions: sanitizedQuestions,
      createdAt: quiz.createdAt,
      updatedAt: quiz.updatedAt,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/v1/courses/:courseId/quiz
 * @desc    Create a quiz for a course
 * @access  Private (instructor, admin)
 */
const createQuiz = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: "Not Found", message: "Course not found" });
    }

    const existing = await Quiz.findOne({ course: courseId });
    if (existing) {
      return res.status(409).json({
        error: "Conflict",
        message: "A quiz already exists for this course. Use PUT to update it.",
      });
    }

    const quiz = await Quiz.create({
      ...req.body,
      course: courseId,
      createdBy: req.user._id,
    });

    res.status(201).json(quiz);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/v1/courses/:courseId/quiz
 * @desc    Update a quiz for a course
 * @access  Private (instructor, admin)
 */
const updateQuiz = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const quiz = await Quiz.findOneAndUpdate(
      { course: courseId },
      req.body,
      { returnDocument: "after", runValidators: true }
    );

    if (!quiz) {
      return res.status(404).json({ error: "Not Found", message: "No quiz found for this course" });
    }

    res.status(200).json(quiz);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/v1/courses/:courseId/quiz
 * @desc    Delete a quiz and its attempts
 * @access  Private (instructor, admin)
 */
const deleteQuiz = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const quiz = await Quiz.findOneAndDelete({ course: courseId });
    if (!quiz) {
      return res.status(404).json({ error: "Not Found", message: "No quiz found for this course" });
    }

    await QuizAttempt.deleteMany({ quiz: quiz._id });

    res.status(200).json({ message: "Quiz deleted successfully" });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/v1/courses/:courseId/quiz/submit
 * @desc    Submit answers for a quiz, evaluate score, and track attempt
 * @access  Private (enrolled student, instructor, admin)
 */
const submitQuizAttempt = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: "Not Found", message: "Course not found" });
    }

    // Verify enrollment for student role
    if (req.user.role === "student") {
      const enrollment = await Enrollment.findOne({
        user: userId,
        course: courseId,
        status: "active",
      });
      if (!enrollment) {
        return res.status(403).json({
          error: "Forbidden",
          message: "You must be enrolled in the course to submit a quiz",
        });
      }
    }

    const quiz = await Quiz.findOne({ course: courseId });
    if (!quiz) {
      return res.status(404).json({ error: "Not Found", message: "No quiz found for this course" });
    }

    const rawAnswers = req.body.answers;
    let score = 0;
    const totalQuestions = quiz.questions.length;

    const answersDetail = quiz.questions.map((q, idx) => {
      let selected;
      if (Array.isArray(rawAnswers)) {
        selected = rawAnswers[idx];
      } else if (rawAnswers && typeof rawAnswers === "object") {
        selected = rawAnswers[idx] !== undefined ? rawAnswers[idx] : rawAnswers[String(idx)];
      }

      const selectedIndex = selected !== undefined && selected !== null ? Number(selected) : -1;
      const isCorrect = selectedIndex === q.correctAnswer;
      if (isCorrect) {
        score++;
      }

      return {
        questionIndex: idx,
        selectedOption: selectedIndex,
        isCorrect,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || "",
      };
    });

    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
    const passed = percentage >= (quiz.passingScore || 80);

    // Persist attempt
    const attempt = await QuizAttempt.create({
      quiz: quiz._id,
      course: courseId,
      user: userId,
      answers: answersDetail.map((a) => ({
        questionIndex: a.questionIndex,
        selectedOption: a.selectedOption,
        isCorrect: a.isCorrect,
      })),
      score,
      totalQuestions,
      percentage,
      passed,
    });

    // Update progress record if passed
    if (passed) {
      await Progress.findOneAndUpdate(
        { user: userId, course: courseId },
        { quizDone: true },
        { returnDocument: "after" }
      );
    }

    res.status(201).json({
      message: passed
        ? "Congratulations, you passed the quiz!"
        : "Quiz completed. You did not meet the passing score.",
      score,
      totalQuestions,
      percentage,
      passed,
      attemptId: attempt._id,
      results: answersDetail,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/v1/courses/:courseId/quiz/attempts
 * @desc    Get past quiz attempts for a course
 * @access  Private
 */
const getQuizAttempts = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    const query = { course: courseId };
    if (req.user.role === "student" || req.query.self === "true") {
      query.user = userId;
    }

    const attempts = await QuizAttempt.find(query)
      .sort({ createdAt: -1 })
      .populate("user", "name email");

    res.status(200).json(attempts);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getQuizByCourse,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  submitQuizAttempt,
  getQuizAttempts,
};
