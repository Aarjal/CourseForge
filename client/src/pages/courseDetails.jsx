import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useCourses } from "../hooks/useCourses";

function CourseDetails() {
  const { courseId } = useParams();
  const {
    courses,
    enrolledCourseIds,
    completedChapters,
    calculateProgress,
    enrollCourse,
    completeChapter,
    loading,
  } = useCourses();

  const course = courses.find((c) => String(c.id) === String(courseId));

  if (loading && !course) {
    return (
      <div className="app-shell">
        <Navbar />
        <main className="main-content">
          <div className="empty-state">
            <p>Loading course details...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="app-shell">
        <Navbar />
        <main className="main-content">
          <div className="empty-state">
            <h3>Course not found</h3>
            <Link className="secondary-button" to="/courses">
              Back to courses
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const isEnrolled = enrolledCourseIds.some((id) => String(id) === String(course.id));
  const progressPercent = calculateProgress(course);
  const courseTitle = course.title || course.name;
  const courseDesc = course.description || course.desc;
  const chapters = course.chapters || [];

  return (
    <div className="app-shell">
      <Navbar />

      <main className="main-content">
        <section className="course-details-page">
          <Link className="back-button" to="/courses">
            ⬅️ Back to courses
          </Link>

          <div className="course-hero">
            <div>
              <p className="eye">{course.category}</p>
              <h1>{courseTitle}</h1>
              <p className="muted">{courseDesc}</p>
              <span className="tag">{course.level}</span>
            </div>

            {isEnrolled ? (
              <span className="enrolled-label">Enrolled</span>
            ) : (
              <button
                className="primary-button"
                onClick={() => enrollCourse(course.id)}
                type="button"
              >
                Enroll In Course
              </button>
            )}
          </div>

          <div className="section-head">
            <div>
              <p className="eye">Course content</p>
              <h2>Chapters</h2>
            </div>
            <strong>{progressPercent}% complete</strong>
          </div>

          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="chapter-list">
            {chapters.map((chapter, index) => {
              const currentCompleted = completedChapters[course.id] || [];
              const isCompleted = currentCompleted.some(
                (id) => String(id) === String(chapter.id)
              );
              const isLocked = !chapter.preview && !isEnrolled;
              const durationLabel =
                typeof chapter.duration === "number"
                  ? `${chapter.duration} mins`
                : chapter.duration;

              return (
                <div className="chapter-row" key={chapter.id}>
                  <div className="chapter-num">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  <div className="chapter-info">
                    <strong>{chapter.title}</strong>
                    <span>{durationLabel}</span>
                  </div>

                  {isLocked ? (
                    <span className="locked">Locked</span>
                  ) : (
                    <button
                      className={isCompleted ? "completed" : "complete-button"}
                      onClick={() => completeChapter(course.id, chapter.id)}
                      type="button"
                    >
                      {isCompleted ? "Completed" : "Mark as completed"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {isEnrolled && (
            <section className="quiz-callout">
              <div>
                <p className="eye">Test Your Knowledge</p>
                <h2>Take the Quiz for what you&apos;ve learned</h2>
                <p className="muted">
                  Complete a short quiz to test your comprehension of this course.
                </p>
              </div>
              <Link className="secondary-button" to="/quiz">
                Take Quiz
              </Link>
            </section>
          )}
        </section>
      </main>
    </div>
  );
}

export default CourseDetails;
