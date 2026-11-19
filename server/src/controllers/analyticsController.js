const Course = require("../models/course");
const Enrollment = require("../models/enrollment");
const Progress = require("../models/progress");
const User = require("../models/user");

/**
 * @route   GET /api/v1/analytics/overview
 * @desc    Get dashboard analytics for instructors and admins
 * @access  Private (instructor, admin)
 */
const getOverview = async (req, res, next) => {
  try {
    const isInstructor = req.user.role === "instructor";
    const courseQuery = isInstructor ? { createdBy: req.user._id } : {};

    // Get relevant courses
    const courses = await Course.find(courseQuery).select("title published price createdAt");
    const courseIds = courses.map((c) => c._id);

    // Enrollments query
    const enrollmentQuery = courseIds.length > 0 ? { course: { $in: courseIds } } : { course: null };
    const [enrollments, totalStudents] = await Promise.all([
      Enrollment.find(enrollmentQuery)
        .populate("user", "name email")
        .populate("course", "title")
        .sort("-enrolledAt")
        .limit(10),
      Enrollment.distinct("user", enrollmentQuery),
    ]);

    // Progress completions
    const totalCompletions = await Progress.countDocuments({
      ...enrollmentQuery,
      completed: true,
    });

    // Per-course analytics breakdown
    const courseStats = await Promise.all(
      courses.map(async (course) => {
        const [enrollmentCount, completionCount] = await Promise.all([
          Enrollment.countDocuments({ course: course._id, status: "active" }),
          Progress.countDocuments({ course: course._id, completed: true }),
        ]);

        const completionRate =
          enrollmentCount > 0 ? Math.round((completionCount / enrollmentCount) * 100) : 0;

        return {
          id: course._id,
          title: course.title,
          published: course.published,
          price: course.price,
          enrollmentsCount: enrollmentCount,
          completionsCount: completionCount,
          completionRate,
        };
      })
    );

    const totalCourses = courses.length;
    const publishedCourses = courses.filter((c) => c.published).length;
    const totalEnrollmentsCount = courseStats.reduce((sum, c) => sum + c.enrollmentsCount, 0);

    res.status(200).json({
      summary: {
        totalCourses,
        publishedCourses,
        draftCourses: totalCourses - publishedCourses,
        totalStudents: totalStudents.length,
        totalEnrollments: totalEnrollmentsCount,
        totalCompletions,
      },
      courses: courseStats,
      recentEnrollments: enrollments.map((e) => ({
        id: e._id,
        user: e.user ? { id: e.user._id, name: e.user.name, email: e.user.email } : null,
        course: e.course ? { id: e.course._id, title: e.course.title } : null,
        enrolledAt: e.enrolledAt,
      })),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOverview,
};
