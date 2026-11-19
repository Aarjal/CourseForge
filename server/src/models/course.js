const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Course title is required"],
      trim: true,
      maxlength: [150, "Course title cannot exceed 150 characters"],
    },
    description: {
      type: String,
      required: [true, "Course description is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Course category is required"],
      trim: true,
    },
    level: {
      type: String,
      required: [true, "Course level is required"],
      enum: {
        values: ["Beginner", "Intermediate", "Advanced"],
        message: "Level must be Beginner, Intermediate, or Advanced",
      },
      trim: true,
    },
    published: {
      type: Boolean,
      default: false,
    },
    price: {
      type: Number,
      default: 0,
      min: [0, "Price cannot be negative"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      // TODO(phase 4): restore required: true when User auth is active
      required: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual field to populate chapters in order
courseSchema.virtual("chapters", {
  ref: "Chapter",
  localField: "_id",
  foreignField: "course",
  options: { sort: { order: 1 } },
});

module.exports = mongoose.model("Course", courseSchema);
