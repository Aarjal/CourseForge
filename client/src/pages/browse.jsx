import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Coursecard from "../components/courseCard";
import { useCourses } from "../hooks/useCourses";

function Browse() {
  const { courses, calculateProgress } = useCourses();
  const [search, setSearch] = useState("");

  const visibleCourses = courses.filter((course) => {
    const title = course.title || course.name || "";
    return (
      course.published !== false &&
      title.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="app-shell">
      <Navbar />

      <main className="main-content">
        <section className="browse-page">
          <Link className="back-button" to="/">
            Back to Dashboard
          </Link>

          <div className="section-head">
            <div>
              <p className="eye">Course Library</p>
              <h1>Browse Courses</h1>
              <p className="muted">Find a practical course and start learning.</p>
            </div>
          </div>

          <input
            className="search-input"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search Courses"
            aria-label="Search Courses"
          />

          {visibleCourses.length === 0 ? (
            <div className="empty-state">
              <h3>No courses found</h3>
              <p>Try searching for a different course.</p>
            </div>
          ) : (
            <div className="course-grid">
              {visibleCourses.map((course) => (
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

export default Browse;
