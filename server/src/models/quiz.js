const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, "Question text is required"],
      trim: true,
    },
    options: {
      type: [String],
      validate: {
        validator: (opts) => Array.isArray(opts) && opts.length >= 2,
        message: "Question must have at least 2 options",
      },
      required: [true, "Options are required"],
    },
    correctAnswer: {
      type: Number,
      required: [true, "Correct answer index is required"],
      min: [0, "Correct answer index cannot be negative"],
    },
    explanation: {
      type: String,
      default: "",
    },
  },
  { _id: true }
);

const quizSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course reference is required"],
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Quiz title is required"],
      trim: true,
      maxlength: [150, "Quiz title cannot exceed 150 characters"],
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    passingScore: {
      type: Number,
      default: 80, // Percentage required to pass
      min: [1, "Passing score must be at least 1%"],
      max: [100, "Passing score cannot exceed 100%"],
    },
    questions: [questionSchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Quiz creator is required"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Quiz", quizSchema);
