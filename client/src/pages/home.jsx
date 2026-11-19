import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Coursecard from "../components/courseCard";
import { useCourses } from "../hooks/useCourses";

function Home() {
  const {
    courses,
    enrolledCourseIds,
    completedChapters,
    quizDone,
    calculateProgress,
  } = useCourses();

  const enrolledCourses = courses.filter((course) =>
    enrolledCourseIds.includes(course.id)
  );
  const totalCompletedChapters = Object.values(completedChapters).flat().length;

  return (
    <div className="app-shell">
      <Navbar />

      <main className="main-content">
        <section className="welcome-sec">
          <div>
            <p className="eye">STUDENT DASHBOARD</p>
            <h1>Keep Learning, Keep Growing, Keep Achieving</h1>
            <p className="muted">Your enrolled courses and current progress.</p>
          </div>

          <Link className="primary-but" to="/courses">
            Explore Courses
          </Link>
        </section>

        <section className="stats-row">
          <div>
            <strong>{totalCompletedChapters}</strong>
            <span>Completed Chapters</span>
          </div>
          <div>
            <strong>{quizDone ? "1" : "0"}</strong>
            <span>Quizzes Completed</span>
          </div>
        </section>

        <section>
          <div className="section-head">
            <div>
              <p className="eye">Your Learning</p>
              <h2>Continue Learning</h2>
            </div>
          </div>

          {enrolledCourses.length === 0 ? (
            <div className="empty-state">
              <h3>No courses yet</h3>
              <p>Explore the course library and start your first course.</p>
              <Link className="sec-button" to="/courses">
                Browse Courses
              </Link>
            </div>
          ) : (
            <div className="course-grid">
              {enrolledCourses.map((course) => (
                <Coursecard
                  key={course.id}
                  course={course}
                  progress={calculateProgress(course)}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Home;
