const mongoose = require("mongoose");

const quizAttemptSchema = new mongoose.Schema(
  {
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: [true, "Quiz reference is required"],
      index: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course reference is required"],
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      index: true,
    },
    answers: [
      {
        questionIndex: { type: Number, required: true },
        selectedOption: { type: Number, required: true },
        isCorrect: { type: Boolean, required: true },
      },
    ],
    score: {
      type: Number,
      required: true,
      min: 0,
    },
    totalQuestions: {
      type: Number,
      required: true,
      min: 1,
    },
    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    passed: {
      type: Boolean,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for querying user attempts per course/quiz
quizAttemptSchema.index({ user: 1, course: 1, createdAt: -1 });

module.exports = mongoose.model("QuizAttempt", quizAttemptSchema);
