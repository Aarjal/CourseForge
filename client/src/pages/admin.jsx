import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useCourses } from "../hooks/useCourses";
import { resolveMediaUrl } from "../api/adapters/httpAdapter";

function Admin() {
  const {
    courses,
    addCourse,
    updateCourse,
    deleteCourse,
    togglePublish,
    addChapter,
    deleteChapter,
    reorderChapters,
    getAnalytics,
    uploadFile,
  } = useCourses();

  const [activeTab, setActiveTab] = useState("manage"); // 'manage' | 'create' | 'analytics'
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  // Create course state
  const [courseForm, setCourseForm] = useState({
    title: "",
    category: "Development",
    level: "Beginner",
    description: "",
    price: 0,
    published: false,
    thumbnail: "",
  });

  const [chapterForm, setChapterForm] = useState({
    title: "",
    duration: "",
    preview: true,
    videoUrl: "",
    materials: [],
  });

  const [draftChapters, setDraftChapters] = useState([]);
  const [chapterTarget, setChapterTarget] = useState("new");

  // Editing existing course state
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  // Chapter management drawer/expansion state
  const [expandedCourseId, setExpandedCourseId] = useState(null);

  // Analytics state
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  useEffect(() => {
    if (activeTab === "analytics") {
      let isCancelled = false;
      async function fetchAnalytics() {
        setAnalyticsLoading(true);
        try {
          const data = await getAnalytics();
          if (!isCancelled) {
            setAnalyticsData(data);
          }
        } catch (err) {
          if (!isCancelled) {
            setErrorMessage(err.message || "Failed to load analytics");
          }
        } finally {
          if (!isCancelled) {
            setAnalyticsLoading(false);
          }
        }
      }
      fetchAnalytics();
      return () => {
        isCancelled = true;
      };
    }
  }, [activeTab, getAnalytics]);

  function showSuccess(msg) {
    setMessage(msg);
    setErrorMessage("");
    setTimeout(() => setMessage(""), 5000);
  }

  function showError(msg) {
    setErrorMessage(msg);
    setMessage("");
  }

  // --- Handlers: Create Course ---
  function handleCourseChange(event) {
    const { name, value, type, checked } = event.target;
    setCourseForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleChapterChange(event) {
    const value =
      event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setChapterForm((prev) => ({
      ...prev,
      [event.target.name]: value,
    }));
  }

  // File upload handlers
  async function handleThumbnailUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      setErrorMessage("");
      const uploaded = await uploadFile(file, "thumbnails");
      setCourseForm((prev) => ({ ...prev, thumbnail: uploaded.url }));
      showSuccess("Thumbnail uploaded successfully.");
    } catch (err) {
      showError(err.message || "Failed to upload thumbnail");
    } finally {
      setUploading(false);
    }
  }

  async function handleEditThumbnailUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      setErrorMessage("");
      const uploaded = await uploadFile(file, "thumbnails");
      setEditFormData((prev) => ({ ...prev, thumbnail: uploaded.url }));
      showSuccess("Thumbnail uploaded successfully.");
    } catch (err) {
      showError(err.message || "Failed to upload thumbnail");
    } finally {
      setUploading(false);
    }
  }

  async function handleVideoUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      setErrorMessage("");
      const uploaded = await uploadFile(file, "videos");
      setChapterForm((prev) => ({ ...prev, videoUrl: uploaded.url }));
      showSuccess("Video uploaded successfully.");
    } catch (err) {
      showError(err.message || "Failed to upload video");
    } finally {
      setUploading(false);
    }
  }

  async function handleMaterialUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      setErrorMessage("");
      const uploaded = await uploadFile(file, "documents");
      const newMaterial = {
        title: file.name,
        url: uploaded.url,
        type: uploaded.mimetype || file.type || "application/pdf",
        size: uploaded.size || file.size || 0,
      };
      setChapterForm((prev) => ({
        ...prev,
        materials: [...(prev.materials || []), newMaterial],
      }));
      showSuccess(`Material "${file.name}" attached.`);
    } catch (err) {
      showError(err.message || "Failed to upload study material");
    } finally {
      setUploading(false);
    }
  }

  function handleRemoveMaterial(index) {
    setChapterForm((prev) => ({
      ...prev,
      materials: (prev.materials || []).filter((_, i) => i !== index),
    }));
  }

  async function handleAddChapter(event) {
    event.preventDefault();

    if (!chapterForm.title || !chapterForm.duration) {
      showError("Add a chapter title and duration.");
      return;
    }

    const newChapter = {
      title: chapterForm.title,
      duration: parseInt(chapterForm.duration, 10) || 15,
      preview: chapterForm.preview,
      type: chapterForm.videoUrl ? "Video" : "Theory",
      videoUrl: chapterForm.videoUrl || "",
      materials: chapterForm.materials || [],
    };

    try {
      if (chapterTarget !== "new") {
        await addChapter(chapterTarget, newChapter);
        showSuccess("Chapter added to the selected course.");
      } else {
        setDraftChapters((prev) => [
          ...prev,
          {
            ...newChapter,
            id: prev.length + 1,
            order: prev.length + 1,
          },
        ]);
        showSuccess("Chapter staged for the new course draft.");
      }

      setChapterForm({
        title: "",
        duration: "",
        preview: true,
        videoUrl: "",
        materials: [],
      });
    } catch (err) {
      showError(err.message || "Failed to add chapter");
    }
  }

  async function handleSaveCourse(event) {
    event.preventDefault();

    const title = courseForm.title;
    const description = courseForm.description;

    if (!title || !description) {
      showError("Add a course name and description.");
      return;
    }

    try {
      await addCourse({
        title,
        description,
        category: courseForm.category,
        level: courseForm.level,
        published: Boolean(courseForm.published),
        price: Number(courseForm.price) || 0,
        thumbnail: courseForm.thumbnail || "",
        chapters: draftChapters,
      });

      showSuccess("Course created successfully.");
      setCourseForm({
        title: "",
        category: "Development",
        level: "Beginner",
        description: "",
        price: 0,
        published: false,
        thumbnail: "",
      });
      setDraftChapters([]);
      setChapterTarget("new");
      setActiveTab("manage");
    } catch (err) {
      showError(err.message || "Failed to create course");
    }
  }

  // --- Handlers: Manage Course Actions ---
  async function handleTogglePublish(courseId) {
    try {
      const updated = await togglePublish(courseId);
      showSuccess(`Course status changed to: ${updated.published ? "Published" : "Draft"}`);
    } catch (err) {
      showError(err.message || "Failed to toggle publish status");
    }
  }

  async function handleDeleteCourse(courseId, courseTitle) {
    if (!window.confirm(`Are you sure you want to delete "${courseTitle}"? This cannot be undone.`)) {
      return;
    }
    try {
      await deleteCourse(courseId);
      showSuccess(`Course "${courseTitle}" deleted.`);
    } catch (err) {
      showError(err.message || "Failed to delete course");
    }
  }

  function startEditCourse(course) {
    setEditingCourseId(course.id);
    setEditFormData({
      title: course.title,
      description: course.description,
      category: course.category,
      level: course.level,
      price: course.price || 0,
      thumbnail: course.thumbnail || "",
    });
  }

  async function saveEditCourse(courseId) {
    try {
      await updateCourse(courseId, editFormData);
      setEditingCourseId(null);
      showSuccess("Course details updated successfully.");
    } catch (err) {
      showError(err.message || "Failed to update course");
    }
  }

  // --- Handlers: Chapter Reordering & Deletion ---
  async function handleMoveChapter(course, chapterIndex, direction) {
    const chapters = [...(course.chapters || [])];
    const targetIndex = chapterIndex + direction;

    if (targetIndex < 0 || targetIndex >= chapters.length) return;

    // Swap positions
    const temp = chapters[chapterIndex];
    chapters[chapterIndex] = chapters[targetIndex];
    chapters[targetIndex] = temp;

    // Build new order array
    const chapterOrders = chapters.map((ch, idx) => ({
      id: String(ch.id),
      order: idx + 1,
    }));

    try {
      await reorderChapters(course.id, chapterOrders);
      showSuccess("Chapter order updated.");
    } catch (err) {
      showError(err.message || "Failed to reorder chapters");
    }
  }

  async function handleDeleteChapter(courseId, chapterId, chapterTitle) {
    if (!window.confirm(`Delete chapter "${chapterTitle}"?`)) return;

    try {
      await deleteChapter(courseId, chapterId);
      showSuccess("Chapter deleted.");
    } catch (err) {
      showError(err.message || "Failed to delete chapter");
    }
  }

  return (
    <div className="app-shell">
      <Navbar />

      <main className="main-content">
        <section className="admin-page">
          <Link className="back-button" to="/">
            Back to Dashboard
          </Link>

          <div className="section-head" style={{ marginBottom: "12px" }}>
            <div>
              <p className="eye">Instructor Tools</p>
              <h1>Control Center</h1>
              <p className="muted">
                Manage your curriculum, author new content, and track student enrollment metrics.
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="admin-tabs">
            <button
              className={`admin-tab-button ${activeTab === "manage" ? "active" : ""}`}
              onClick={() => setActiveTab("manage")}
              type="button"
            >
              📚 Course Catalog ({courses.length})
            </button>
            <button
              className={`admin-tab-button ${activeTab === "create" ? "active" : ""}`}
              onClick={() => setActiveTab("create")}
              type="button"
            >
              ➕ Create Course
            </button>
            <button
              className={`admin-tab-button ${activeTab === "analytics" ? "active" : ""}`}
              onClick={() => setActiveTab("analytics")}
              type="button"
            >
              📊 Analytics & Enrollments
            </button>
          </div>

          {message && <p className="form-message">{message}</p>}
          {errorMessage && <p className="error">{errorMessage}</p>}

          {/* ================= TAB 1: MANAGE COURSES ================= */}
          {activeTab === "manage" && (
            <div>
              {courses.length === 0 ? (
                <div className="empty-state">
                  <h3>No courses created yet</h3>
                  <p>Get started by clicking &quot;Create Course&quot;.</p>
                </div>
              ) : (
                courses.map((course) => {
                  const isEditing = editingCourseId === course.id;
                  const isExpanded = expandedCourseId === course.id;
                  const chapters = course.chapters || [];

                  return (
                    <div className="admin-course-item" key={course.id}>
                      {isEditing ? (
                        <div style={{ display: "grid", gap: "10px" }}>
                          <label>
                            Title
                            <input
                              value={editFormData.title}
                              onChange={(e) =>
                                setEditFormData({ ...editFormData, title: e.target.value })
                              }
                            />
                          </label>
                          <label>
                            Description
                            <textarea
                              value={editFormData.description}
                              onChange={(e) =>
                                setEditFormData({
                                  ...editFormData,
                                  description: e.target.value,
                                })
                              }
                            />
                          </label>
                          <div style={{ display: "flex", gap: "12px" }}>
                            <label style={{ flex: 1 }}>
                              Category
                              <input
                                value={editFormData.category}
                                onChange={(e) =>
                                  setEditFormData({
                                    ...editFormData,
                                    category: e.target.value,
                                  })
                                }
                              />
                            </label>
                            <label style={{ flex: 1 }}>
                              Level
                              <select
                                value={editFormData.level}
                                onChange={(e) =>
                                  setEditFormData({ ...editFormData, level: e.target.value })
                                }
                              >
                                <option>Beginner</option>
                                <option>Intermediate</option>
                                <option>Advanced</option>
                              </select>
                            </label>
                          </div>
                          <label>
                            Thumbnail (Image URL or Upload)
                            <div className="upload-field-group">
                              <input
                                value={editFormData.thumbnail || ""}
                                onChange={(e) =>
                                  setEditFormData({ ...editFormData, thumbnail: e.target.value })
                                }
                                placeholder="https://... or /uploads/..."
                              />
                              <label className="admin-small-button" style={{ cursor: "pointer", margin: 0 }}>
                                📁 Upload
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleEditThumbnailUpload}
                                  style={{ display: "none" }}
                                />
                              </label>
                            </div>
                            {editFormData.thumbnail && (
                              <img
                                src={resolveMediaUrl(editFormData.thumbnail)}
                                alt="Thumbnail Preview"
                                className="upload-preview"
                              />
                            )}
                          </label>
                          <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                            <button
                              className="admin-small-button primary"
                              onClick={() => saveEditCourse(course.id)}
                              type="button"
                            >
                              Save Changes
                            </button>
                            <button
                              className="admin-small-button"
                              onClick={() => setEditingCourseId(null)}
                              type="button"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="admin-course-header">
                            <div>
                              <h3 style={{ margin: "0 0 6px 0" }}>{course.title}</h3>
                              <p className="muted" style={{ margin: "0 0 8px 0" }}>
                                {course.description}
                              </p>
                              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                <span
                                  className="tag"
                                  style={{
                                    background: course.published ? "#d4edda" : "#fff3cd",
                                    color: course.published ? "#155724" : "#856404",
                                  }}
                                >
                                  {course.published ? "Published" : "Draft"}
                                </span>
                                <span className="tag">{course.level}</span>
                                <span className="tag">{course.category}</span>
                                <span className="muted" style={{ fontSize: "12px" }}>
                                  {chapters.length} chapters
                                </span>
                              </div>
                            </div>

                            <div className="admin-actions">
                              <button
                                className="admin-small-button"
                                onClick={() => handleTogglePublish(course.id)}
                                type="button"
                              >
                                {course.published ? "Unpublish" : "Publish"}
                              </button>
                              <button
                                className="admin-small-button"
                                onClick={() => startEditCourse(course)}
                                type="button"
                              >
                                ✏️ Edit
                              </button>
                              <button
                                className="admin-small-button"
                                onClick={() =>
                                  setExpandedCourseId(isExpanded ? null : course.id)
                                }
                                type="button"
                              >
                                📑 {isExpanded ? "Hide Chapters" : "Chapters"}
                              </button>
                              <button
                                className="admin-small-button danger"
                                onClick={() => handleDeleteCourse(course.id, course.title)}
                                type="button"
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          </div>

                          {/* Expanded Chapters Drawer with Reordering */}
                          {isExpanded && (
                            <div
                              style={{
                                marginTop: "16px",
                                borderTop: "1px solid var(--line)",
                                paddingTop: "12px",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  marginBottom: "8px",
                                }}
                              >
                                <strong>Curriculum Chapters ({chapters.length})</strong>
                                <span className="muted" style={{ fontSize: "12px" }}>
                                  Use ▲ and ▼ to reorder chapters
                                </span>
                              </div>

                              {chapters.length === 0 ? (
                                <p className="muted">No chapters yet. Add chapters below.</p>
                              ) : (
                                <div className="chapter-list">
                                  {chapters.map((ch, idx) => (
                                    <div
                                      className="chapter-row"
                                      key={ch.id}
                                      style={{ padding: "8px 12px" }}
                                    >
                                      <span className="chapter-num">
                                        {String(idx + 1).padStart(2, "0")}
                                      </span>
                                      <div className="chapter-info">
                                        <strong>{ch.title}</strong>
                                        <span>
                                          {ch.duration} mins • {ch.preview ? "Preview" : "Locked"}
                                        </span>
                                      </div>
                                      <div style={{ display: "flex", gap: "4px" }}>
                                        <button
                                          className="order-btn"
                                          disabled={idx === 0}
                                          onClick={() => handleMoveChapter(course, idx, -1)}
                                          title="Move Up"
                                          type="button"
                                        >
                                          ▲
                                        </button>
                                        <button
                                          className="order-btn"
                                          disabled={idx === chapters.length - 1}
                                          onClick={() => handleMoveChapter(course, idx, 1)}
                                          title="Move Down"
                                          type="button"
                                        >
                                          ▼
                                        </button>
                                        <button
                                          className="admin-small-button danger"
                                          style={{ padding: "2px 8px" }}
                                          onClick={() =>
                                            handleDeleteChapter(course.id, ch.id, ch.title)
                                          }
                                          title="Delete Chapter"
                                          type="button"
                                        >
                                          ✕
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* ================= TAB 2: CREATE COURSE ================= */}
          {activeTab === "create" && (
            <div>
              <form className="admin-form" onSubmit={handleSaveCourse}>
                <label>
                  Course Name
                  <input
                    name="title"
                    value={courseForm.title}
                    onChange={handleCourseChange}
                    placeholder="eg: html basics"
                    required
                  />
                </label>

                <label>
                  Description
                  <textarea
                    name="description"
                    value={courseForm.description}
                    onChange={handleCourseChange}
                    placeholder="Describe what learners will achieve..."
                    required
                  />
                </label>

                <div style={{ display: "flex", gap: "12px" }}>
                  <label style={{ flex: 1 }}>
                    Category
                    <input
                      name="category"
                      value={courseForm.category}
                      onChange={handleCourseChange}
                    />
                  </label>

                  <label style={{ flex: 1 }}>
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
                </div>

                <label>
                  Thumbnail (Image URL or Upload)
                  <div className="upload-field-group">
                    <input
                      name="thumbnail"
                      value={courseForm.thumbnail || ""}
                      onChange={handleCourseChange}
                      placeholder="Image URL or upload a file"
                    />
                    <label className="admin-small-button" style={{ cursor: "pointer", margin: 0 }}>
                      📁 Upload
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailUpload}
                        style={{ display: "none" }}
                      />
                    </label>
                  </div>
                  {courseForm.thumbnail && (
                    <img
                      src={resolveMediaUrl(courseForm.thumbnail)}
                      alt="Thumbnail Preview"
                      className="upload-preview"
                    />
                  )}
                </label>

                <label className="checkbox-row">
                  <input
                    name="published"
                    type="checkbox"
                    checked={courseForm.published}
                    onChange={handleCourseChange}
                  />
                  Publish immediately upon creation
                </label>

                <button className="primary-button" type="submit" disabled={uploading}>
                  {uploading ? "Uploading..." : "Save and Create Course"}
                </button>
              </form>

              <hr />

              <h2>Stage Chapters</h2>
              <p className="muted" style={{ marginBottom: "16px" }}>
                Add chapters directly into your new course draft or attach them to an existing course.
              </p>

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
                    placeholder="eg: HTML Foundations"
                  />
                </label>

                <label>
                  Duration (minutes)
                  <input
                    name="duration"
                    value={chapterForm.duration}
                    onChange={handleChapterChange}
                    placeholder="15"
                  />
                </label>

                <label>
                  Video Lecture (URL or Upload)
                  <div className="upload-field-group">
                    <input
                      name="videoUrl"
                      value={chapterForm.videoUrl || ""}
                      onChange={handleChapterChange}
                      placeholder="Video URL or upload video file"
                    />
                    <label className="admin-small-button" style={{ cursor: "pointer", margin: 0 }}>
                      🎥 Upload Video
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleVideoUpload}
                        style={{ display: "none" }}
                      />
                    </label>
                  </div>
                </label>

                <label>
                  Study Materials (PDFs, Notes)
                  <div className="upload-field-group">
                    <label className="admin-small-button" style={{ cursor: "pointer", margin: 0 }}>
                      📄 Attach PDF / Document
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.txt"
                        onChange={handleChapterMaterialUpload}
                        style={{ display: "none" }}
                      />
                    </label>
                  </div>
                  {chapterForm.materials && chapterForm.materials.length > 0 && (
                    <ul className="materials-list" style={{ marginTop: "8px" }}>
                      {chapterForm.materials.map((m, idx) => (
                        <li key={idx} className="material-item">
                          <span className="material-info">
                            📄 <strong>{m.title}</strong>
                            {m.size ? (
                              <span className="material-size">
                                ({(m.size / 1024).toFixed(1)} KB)
                              </span>
                            ) : null}
                          </span>
                          <button
                            type="button"
                            className="admin-small-button danger"
                            onClick={() => handleRemoveMaterial(idx)}
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </label>

                <label className="checkbox-row">
                  <input
                    name="preview"
                    type="checkbox"
                    checked={chapterForm.preview}
                    onChange={handleChapterChange}
                  />
                  Public preview (accessible without enrollment)
                </label>

                <button className="secondary-button" type="submit" disabled={uploading}>
                  {uploading ? "Uploading..." : "Add chapter"}
                </button>
              </form>

              {draftChapters.length > 0 && (
                <div style={{ marginTop: "24px" }}>
                  <h3>Staged Chapters for Draft ({draftChapters.length})</h3>
                  <div className="chapter-list">
                    {draftChapters.map((chapter, index) => (
                      <div className="chapter-row" key={chapter.id}>
                        <span className="chapter-num">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <div className="chapter-info">
                          <strong>{chapter.title}</strong>
                          <span>{chapter.duration} mins</span>
                        </div>
                        <span className="tag">
                          {chapter.preview ? "Preview" : "Locked"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 3: ANALYTICS ================= */}
          {activeTab === "analytics" && (
            <div>
              {analyticsLoading ? (
                <p>Loading analytics data...</p>
              ) : analyticsData ? (
                <div>
                  {/* Summary Metric Cards */}
                  <div className="analytics-grid">
                    <div className="analytics-card">
                      <div className="analytics-stat">
                        {analyticsData.summary?.totalCourses ?? 0}
                      </div>
                      <div className="analytics-label">Total Courses</div>
                    </div>
                    <div className="analytics-card">
                      <div className="analytics-stat">
                        {analyticsData.summary?.totalStudents ?? 0}
                      </div>
                      <div className="analytics-label">Unique Students</div>
                    </div>
                    <div className="analytics-card">
                      <div className="analytics-stat">
                        {analyticsData.summary?.totalEnrollments ?? 0}
                      </div>
                      <div className="analytics-label">Total Enrollments</div>
                    </div>
                    <div className="analytics-card">
                      <div className="analytics-stat">
                        {analyticsData.summary?.totalCompletions ?? 0}
                      </div>
                      <div className="analytics-label">Completions</div>
                    </div>
                  </div>

                  {/* Course Performance Table */}
                  <h3>Course Performance</h3>
                  <table className="analytics-table">
                    <thead>
                      <tr>
                        <th>Course</th>
                        <th>Status</th>
                        <th>Enrollments</th>
                        <th>Completions</th>
                        <th>Completion Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(analyticsData.courses || []).map((c) => (
                        <tr key={c.id}>
                          <td>
                            <strong>{c.title}</strong>
                          </td>
                          <td>
                            <span
                              className="tag"
                              style={{
                                background: c.published ? "#d4edda" : "#fff3cd",
                                color: c.published ? "#155724" : "#856404",
                              }}
                            >
                              {c.published ? "Published" : "Draft"}
                            </span>
                          </td>
                          <td>{c.enrollmentsCount}</td>
                          <td>{c.completionsCount}</td>
                          <td>{c.completionRate}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Recent Enrollments */}
                  <h3>Recent Student Activity</h3>
                  {(!analyticsData.recentEnrollments ||
                    analyticsData.recentEnrollments.length === 0) ? (
                    <p className="muted">No student enrollments recorded yet.</p>
                  ) : (
                    <table className="analytics-table">
                      <thead>
                        <tr>
                          <th>Student</th>
                          <th>Course</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analyticsData.recentEnrollments.map((enr) => (
                          <tr key={enr.id}>
                            <td>
                              <strong>{enr.user?.name || "Student"}</strong>
                              <br />
                              <span className="muted" style={{ fontSize: "12px" }}>
                                {enr.user?.email}
                              </span>
                            </td>
                            <td>{enr.course?.title || "Course"}</td>
                            <td>{new Date(enr.enrolledAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              ) : (
                <p className="muted">No analytics data available.</p>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Admin;
