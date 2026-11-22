import { Link } from "react-router-dom";
import { resolveMediaUrl } from "../api/adapters/httpAdapter";

function Coursecard({ course, progress = 0, onOpen }) {
  const chapterCount = course.chapters?.length ?? 0;
  const challengeCount = course.challenge?.length ?? 0;
  const courseTitle = course.name || course.title;
  const courseDesc = course.desc || course.description;
  const thumbnailUrl = course.thumbnail ? resolveMediaUrl(course.thumbnail) : null;

  return (
    <article className="course-card">
      <div
        className={`course-cover ${thumbnailUrl ? "has-thumbnail" : ""}`}
        style={
          thumbnailUrl
            ? {
                backgroundImage: `url(${thumbnailUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : undefined
        }
      >
        {!thumbnailUrl && (
          <>
            <span>{course.category}</span>
            <strong>{course.id}</strong>
          </>
        )}
      </div>

      <div className="course-card-content">
        <span className="tag">{course.level}</span>
        <h3>{courseTitle}</h3>
        <p>{courseDesc}</p>

        <div className="card-meta">
          <span>{chapterCount} chapters</span>
          <span>{progress}% complete</span>
          <span>{challengeCount} challenge</span>
        </div>

        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>

        {onOpen ? (
          <button className="secondary-button full-width" onClick={onOpen} type="button">
            View Course
          </button>
        ) : (
          <Link
            className="secondary-button full-width"
            to={`/courses/${course.id}`}
            style={{ display: "inline-block", textAlign: "center", textDecoration: "none" }}
          >
            View Course
          </Link>
        )}
      </div>
    </article>
  );
}

export default Coursecard;
