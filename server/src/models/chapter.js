const mongoose = require("mongoose");

const chapterSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course reference is required"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Chapter title is required"],
      trim: true,
      maxlength: [150, "Chapter title cannot exceed 150 characters"],
    },
    duration: {
      type: Number,
      required: [true, "Duration in minutes is required"],
      min: [1, "Duration must be at least 1 minute"],
    },
    preview: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      required: [true, "Chapter order is required"],
    },
    type: {
      type: String,
      enum: ["Theory", "Lab", "Video"],
      default: "Theory",
    },
    content: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

chapterSchema.index({ course: 1, order: 1 });

module.exports = mongoose.model("Chapter", chapterSchema);
