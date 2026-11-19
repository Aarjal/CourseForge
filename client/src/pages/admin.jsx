import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useCourses } from "../hooks/useCourses";

function Admin() {
  const { courses, addCourse, addChapter } = useCourses();

  const [courseForm, setCourseForm] = useState({
    title: "",
    category: "Development",
    level: "Beginner",
    description: "",
  });

  const [chapterForm, setChapterForm] = useState({
    title: "",
    duration: "",
    preview: true,
  });

  const [draftChapters, setDraftChapters] = useState([]);
  const [chapterTarget, setChapterTarget] = useState("new");
  const [published, setPublished] = useState(false);
  const [message, setMessage] = useState("");

  function handleCourseChange(event) {
    const { name, value } = event.target;
    setCourseForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleChapterChange(event) {
    const value =
      event.target.type === "checkbox"
        ? event.target.checked
        : event.target.value;

    setChapterForm((prev) => ({
      ...prev,
      [event.target.name]: value,
    }));
  }

  function handleAddChapter(event) {
    event.preventDefault();

    if (!chapterForm.title || !chapterForm.duration) {
      setMessage("Add a chapter title and duration.");
      return;
    }

    const newChapter = {
      title: chapterForm.title,
      duration: chapterForm.duration,
      preview: chapterForm.preview,
      type: "Theory",
    };

    if (chapterTarget !== "new") {
      addChapter(chapterTarget, newChapter);
      setMessage("Chapter added to the selected course.");
    } else {
      setDraftChapters((prev) => [
        ...prev,
        {
          ...newChapter,
          id: prev.length + 1,
        },
      ]);
      setMessage("Chapter added to the new course draft.");
    }

    setChapterForm({
      title: "",
      duration: "",
      preview: true,
    });
  }

  function handleSaveCourse(event) {
    event.preventDefault();

    const title = courseForm.title;
    const description = courseForm.description;

    if (!title || !description) {
      setMessage("Add a course name and description.");
      return;
    }

    addCourse({
      name: title,
      title: title,
      desc: description,
      description: description,
      category: courseForm.category,
      level: courseForm.level,
      published,
      chapters: draftChapters,
      challenge: [],
    });

    setMessage("Course saved successfully.");
    setCourseForm({
      title: "",
      category: "Development",
      level: "Beginner",
      description: "",
    });
    setDraftChapters([]);
    setChapterTarget("new");
    setPublished(false);
  }

  return (
    <div className="app-shell">
      <Navbar />

      <main className="main-content">
        <section className="admin-page">
          <Link className="back-button" to="/">
            Back to Dashboard
          </Link>

          <p className="eye">Admin tools</p>
          <h1>Create a course</h1>
          <p className="muted">Add course info and build the chapter list.</p>

          <form className="admin-form" onSubmit={handleSaveCourse}>
            <label>
              Course Name
              <input
                name="title"
                value={courseForm.title}
                onChange={handleCourseChange}
                placeholder="eg: html basics"
              />
            </label>

            <label>
              Description
              <textarea
                name="description"
                value={courseForm.description}
                onChange={handleCourseChange}
                placeholder="Describe what learners will achieve..."
              />
            </label>

            <label>
              Category
              <input
                name="category"
                value={courseForm.category}
                onChange={handleCourseChange}
              />
            </label>

            <label>
              Level
              <select
                name="level"
                value={courseForm.level}
                onChange={handleCourseChange}
              >
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </label>

            <label className="checkbox-row">
              <input
                name="published"
                type="checkbox"
                checked={published}
                onChange={(event) => setPublished(event.target.checked)}
              />
              Publish this course
            </label>

            <button className="primary-button" type="submit">
              Save course
            </button>
          </form>

          <hr />

          <h2>Add chapters</h2>

          <form className="admin-form" onSubmit={handleAddChapter}>
            <label>
              Insert Chapter into
              <select
                value={chapterTarget}
                onChange={(event) => setChapterTarget(event.target.value)}
              >
                <option value="new">New course draft</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title || course.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Chapter title
              <input
                name="title"
                value={chapterForm.title}
                onChange={handleChapterChange}
                placeholder="eg: html tags"
              />
            </label>

            <label>
              Duration
              <input
                name="duration"
                value={chapterForm.duration}
                onChange={handleChapterChange}
                placeholder="20 mins"
              />
            </label>

            <label className="checkbox-row">
              <input
                name="preview"
                type="checkbox"
                checked={chapterForm.preview}
                onChange={handleChapterChange}
              />
              Public preview
            </label>

            <button className="secondary-button" type="submit">
              Add chapter
            </button>
          </form>

          {message && <p className="form-message">{message}</p>}

          {draftChapters.length > 0 && (
            <div className="chapter-list">
              {draftChapters.map((chapter, index) => (
                <div className="chapter-row" key={chapter.id}>
                  <span className="chapter-num">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="chapter-info">
                    <strong>{chapter.title}</strong>
                    <span>{chapter.duration}</span>
                  </div>
                  <span className="tag">
                    {chapter.preview ? "Preview" : "Locked"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Admin;
