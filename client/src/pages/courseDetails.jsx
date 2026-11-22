import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useCourses } from "../hooks/useCourses";
import { resolveMediaUrl } from "../api/adapters/httpAdapter";

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

  const [selectedChapterId, setSelectedChapterId] = useState(null);

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
  const activeChapter =
    chapters.find((c) => String(c.id) === String(selectedChapterId)) || chapters[0] || null;
  const isActiveLocked = activeChapter ? !activeChapter.preview && !isEnrolled : false;

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

            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "12px" }}>
              {course.thumbnail && (
                <img
                  src={resolveMediaUrl(course.thumbnail)}
                  alt={courseTitle}
                  style={{
                    width: "120px",
                    height: "80px",
                    objectFit: "cover",
                    borderRadius: "4px",
                    border: "1px solid var(--line)",
                  }}
                />
              )}
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
          </div>

          {activeChapter && (
            <div className="active-chapter-viewer">
              <div className="active-chapter-header">
                <div>
                  <span className="tag">{activeChapter.type || "Theory"}</span>
                  {activeChapter.preview && (
                    <span className="tag" style={{ marginLeft: "8px" }}>
                      Free Preview
                    </span>
                  )}
                  <h3 style={{ marginTop: "8px" }}>{activeChapter.title}</h3>
                </div>
                <div>
                  <span className="muted">
                    {typeof activeChapter.duration === "number"
                      ? `${activeChapter.duration} mins`
                      : activeChapter.duration}
                  </span>
                </div>
              </div>

              {isActiveLocked ? (
                <div className="chapter-locked-card">
                  <div style={{ fontSize: "28px", marginBottom: "8px" }}>🔒</div>
                  <h4>This Chapter is Locked</h4>
                  <p className="muted" style={{ margin: "8px 0 16px" }}>
                    Enroll in this course to watch video lectures, access study notes, and download materials.
                  </p>
                  {!isEnrolled && (
                    <button
                      className="primary-button"
                      onClick={() => enrollCourse(course.id)}
                      type="button"
                    >
                      Enroll to Unlock
                    </button>
                  )}
                </div>
              ) : (
                <>
                  {activeChapter.videoUrl && (
                    <div className="video-player-container">
                      <video
                        className="chapter-video"
                        controls
                        src={resolveMediaUrl(activeChapter.videoUrl)}
                        poster={course.thumbnail ? resolveMediaUrl(course.thumbnail) : undefined}
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  )}

                  {activeChapter.content && (
                    <div className="chapter-body-content">
                      <p>{activeChapter.content}</p>
                    </div>
                  )}

                  {activeChapter.materials && activeChapter.materials.length > 0 && (
                    <div className="chapter-materials-section">
                      <h4>📚 Study Materials & Resources</h4>
                      <ul className="materials-list">
                        {activeChapter.materials.map((mat, idx) => (
                          <li key={idx} className="material-item">
                            <div className="material-info">
                              <span>📄</span>
                              <strong>{mat.title}</strong>
                              {mat.size ? (
                                <span className="material-size">
                                  ({(mat.size / 1024).toFixed(1)} KB)
                                </span>
                              ) : null}
                            </div>
                            <a
                              className="download-link"
                              href={resolveMediaUrl(mat.url)}
                              target="_blank"
                              rel="noopener noreferrer"
                              download
                            >
                              Download
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

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
              const isSelected =
                activeChapter && String(activeChapter.id) === String(chapter.id);
              const durationLabel =
                typeof chapter.duration === "number"
                  ? `${chapter.duration} mins`
                  : chapter.duration;

              return (
                <div
                  className={`chapter-row ${isSelected ? "active" : ""}`}
                  key={chapter.id}
                  onClick={() => setSelectedChapterId(chapter.id)}
                  style={{ cursor: "pointer" }}
                >
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
                      onClick={(e) => {
                        e.stopPropagation();
                        completeChapter(course.id, chapter.id);
                      }}
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
