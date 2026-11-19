const Enrollment = require("../models/enrollment");
const Progress = require("../models/progress");
const Course = require("../models/course");

/**
 * @route   POST /api/v1/enrollments/:courseId
 * @desc    Enroll current user in a course
 * @access  Private
 */
const enrollInCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: "Not Found", message: "Course not found" });
    }

    // Check if already enrolled
    let enrollment = await Enrollment.findOne({ user: userId, course: courseId });
    if (enrollment) {
      return res.status(200).json({
        message: "Already enrolled in this course",
        enrollment,
      });
    }

    enrollment = await Enrollment.create({
      user: userId,
      course: courseId,
      status: "active",
    });

    // Initialize progress tracking record if not present
    await Progress.findOneAndUpdate(
      { user: userId, course: courseId },
      { $setOnInsert: { user: userId, course: courseId, completedChapters: [] } },
      { upsert: true, returnDocument: "after" }
    );

    res.status(201).json({
      message: "Successfully enrolled in course",
      enrollment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/v1/enrollments
 * @desc    Get all enrolled courses for current user
 * @access  Private
 */
const getUserEnrollments = async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({
      user: req.user._id,
      status: "active",
    }).populate({
      path: "course",
      select: "title description category level published price",
    });

    const enrolledCourseIds = enrollments.map((e) => e.course?._id || e.course);

    res.status(200).json({
      enrollments,
      enrolledCourseIds,
      count: enrollments.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/v1/enrollments/:courseId
 * @desc    Check enrollment status for a specific course
 * @access  Private
 */
const checkEnrollment = async (req, res, next) => {
  try {
    const enrollment = await Enrollment.findOne({
      user: req.user._id,
      course: req.params.courseId,
      status: "active",
    });

    res.status(200).json({
      isEnrolled: Boolean(enrollment),
      enrollment: enrollment || null,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  enrollInCourse,
  getUserEnrollments,
  checkEnrollment,
};
