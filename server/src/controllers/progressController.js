const Progress = require("../models/progress");
const Chapter = require("../models/chapter");
const Enrollment = require("../models/enrollment");

/**
 * @route   GET /api/v1/progress
 * @desc    Get all course progress for current user
 * @access  Private
 */
const getUserProgress = async (req, res, next) => {
  try {
    const progressList = await Progress.find({ user: req.user._id }).populate({
      path: "lastAccessedChapter",
      select: "title order duration",
    });

    // Also format as a completedChapters map for convenience: { [courseId]: [chapId1, chapId2] }
    const completedMap = {};
    progressList.forEach((p) => {
      completedMap[p.course] = p.completedChapters;
    });

    res.status(200).json({
      progress: progressList,
      completedChapters: completedMap,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/v1/progress/:courseId
 * @desc    Get progress details for a specific course
 * @access  Private
 */
const getCourseProgress = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    let progress = await Progress.findOne({ user: userId, course: courseId });
    const totalChapters = await Chapter.countDocuments({ course: courseId });

    if (!progress) {
      return res.status(200).json({
        courseId,
        completedChapters: [],
        totalChapters,
        percentage: 0,
        completed: false,
        lastAccessedChapter: null,
      });
    }

    const completedCount = progress.completedChapters.length;
    const percentage = totalChapters > 0 ? Math.round((completedCount / totalChapters) * 100) : 0;

    res.status(200).json({
      courseId,
      completedChapters: progress.completedChapters,
      totalChapters,
      percentage,
      completed: progress.completed,
      completedAt: progress.completedAt,
      lastAccessedChapter: progress.lastAccessedChapter,
      lastAccessedAt: progress.lastAccessedAt,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/v1/progress/:courseId/chapters/:chapterId
 * @desc    Mark a chapter as completed
 * @access  Private
 */
const completeChapter = async (req, res, next) => {
  try {
    const { courseId, chapterId } = req.params;
    const userId = req.user._id;

    // Verify chapter exists and belongs to this course
    const chapter = await Chapter.findOne({ _id: chapterId, course: courseId });
    if (!chapter) {
      return res.status(404).json({
        error: "Not Found",
        message: "Chapter not found in this course",
      });
    }

    // Verify enrollment
    const isEnrolled = await Enrollment.findOne({
      user: userId,
      course: courseId,
      status: "active",
    });

    if (!isEnrolled && req.user.role !== "admin" && req.user.role !== "instructor") {
      return res.status(403).json({
        error: "Forbidden",
        message: "Must be enrolled in the course to record chapter progress",
      });
    }

    let progress = await Progress.findOne({ user: userId, course: courseId });
    if (!progress) {
      progress = await Progress.create({
        user: userId,
        course: courseId,
        completedChapters: [],
      });
    }

    // Add chapter if not already completed
    if (!progress.completedChapters.includes(chapterId)) {
      progress.completedChapters.push(chapterId);
    }

    progress.lastAccessedChapter = chapterId;
    progress.lastAccessedAt = new Date();

    // Check if all chapters in the course are completed
    const totalChapters = await Chapter.countDocuments({ course: courseId });
    if (totalChapters > 0 && progress.completedChapters.length >= totalChapters) {
      progress.completed = true;
      progress.completedAt = progress.completedAt || new Date();
    }

    await progress.save();

    const percentage =
      totalChapters > 0
        ? Math.round((progress.completedChapters.length / totalChapters) * 100)
        : 100;

    res.status(200).json({
      message: "Chapter marked as completed",
      completedChapters: progress.completedChapters,
      percentage,
      courseCompleted: progress.completed,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/v1/progress/:courseId/last-accessed/:chapterId
 * @desc    Update the last accessed chapter (resume point)
 * @access  Private
 */
const updateLastAccessed = async (req, res, next) => {
  try {
    const { courseId, chapterId } = req.params;
    const userId = req.user._id;

    const progress = await Progress.findOneAndUpdate(
      { user: userId, course: courseId },
      {
        lastAccessedChapter: chapterId,
        lastAccessedAt: new Date(),
      },
      { upsert: true, returnDocument: "after" }
    );

    res.status(200).json({
      message: "Resume point updated",
      lastAccessedChapter: progress.lastAccessedChapter,
      lastAccessedAt: progress.lastAccessedAt,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserProgress,
  getCourseProgress,
  completeChapter,
  updateLastAccessed,
};
