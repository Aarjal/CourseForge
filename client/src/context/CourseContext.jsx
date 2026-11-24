import { useState, useEffect, useCallback } from "react";
import { CourseContext } from "./courseContextDef";
import { useAuth } from "../hooks/useAuth";
import { api } from "../api";
import { DEFAULT_QUIZ_QUESTIONS } from "../services/storage";

export function CourseProvider({ children }) {
  const { isLoggedIn } = useAuth();
  const [courses, setCourses] = useState([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);
  const [completedChapters, setCompletedChapters] = useState({});
  const [quizDone, setQuizDone] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState(DEFAULT_QUIZ_QUESTIONS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isCancelled = false;

    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [fetchedCourses, fetchedEnrollments, fetchedProgress, fetchedQuestions] =
          await Promise.all([
            api.getCourses(),
            api.getEnrollments().catch(() => []),
            api.getProgress().catch(() => ({ completedChapters: {}, quizDone: false })),
            api.getQuizQuestions().catch(() => DEFAULT_QUIZ_QUESTIONS),
          ]);

        if (!isCancelled) {
          setCourses(fetchedCourses || []);
          setEnrolledCourseIds(fetchedEnrollments || []);
          setCompletedChapters(fetchedProgress?.completedChapters || {});
          setQuizDone(Boolean(fetchedProgress?.quizDone));
          setQuizQuestions(fetchedQuestions || DEFAULT_QUIZ_QUESTIONS);
          setLoading(false);
        }
      } catch (err) {
        if (!isCancelled) {
          console.error("Failed to fetch course data:", err);
          setError(err.message || "Failed to load courses");
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isCancelled = true;
    };
  }, [isLoggedIn]);

  async function enrollCourse(courseId) {
    if (enrolledCourseIds.some((id) => String(id) === String(courseId))) {
      return;
    }
    await api.enroll(courseId);
    setEnrolledCourseIds((prev) => [...prev, courseId]);
  }

  async function completeChapter(courseId, chapterId) {
    const currentCompleted = completedChapters[courseId] || [];

    if (currentCompleted.some((id) => String(id) === String(chapterId))) {
      return;
    }

    await api.completeChapter(courseId, chapterId);
    setCompletedChapters((prev) => ({
      ...prev,
      [courseId]: [...currentCompleted, chapterId],
    }));
  }

  function calculateProgress(course) {
    if (!course || !course.chapters || course.chapters.length === 0) {
      return 0;
    }
    const completedCount = (completedChapters[course.id] || []).length;
    return Math.round((completedCount / course.chapters.length) * 100);
  }

  async function submitQuiz(courseIdOrAnswers, maybeAnswers) {
    const result = await api.submitQuiz(courseIdOrAnswers, maybeAnswers);
    if (result && result.passed) {
      setQuizDone(true);
    }
    return result;
  }

  const getQuizByCourse = useCallback(async (courseId) => {
    return api.getQuizByCourse(courseId);
  }, []);

  const createQuiz = useCallback(async (courseId, quizData) => {
    return api.createQuiz(courseId, quizData);
  }, []);

  const updateQuiz = useCallback(async (courseId, quizData) => {
    return api.updateQuiz(courseId, quizData);
  }, []);

  const deleteQuiz = useCallback(async (courseId) => {
    return api.deleteQuiz(courseId);
  }, []);

  const getQuizAttempts = useCallback(async (courseId) => {
    return api.getQuizAttempts(courseId);
  }, []);

  async function addCourse(courseData) {
    const created = await api.createCourse(courseData);
    let finalCourse = created;

    // If draft chapters were staged on the course, insert them if not already attached
    if (
      courseData.chapters &&
      courseData.chapters.length > 0 &&
      (!created.chapters || created.chapters.length === 0)
    ) {
      const addedChapters = [];
      for (const ch of courseData.chapters) {
        try {
          const addedCh = await api.addChapter(created.id, ch);
          addedChapters.push(addedCh);
        } catch (chErr) {
          console.warn("Could not attach draft chapter:", chErr.message);
        }
      }
      finalCourse = { ...created, chapters: addedChapters };
    }

    setCourses((prev) => [...prev, finalCourse]);
    return finalCourse;
  }

  async function addChapter(targetId, chapterData) {
    if (targetId === "new") {
      return chapterData;
    }
    const newChapter = await api.addChapter(targetId, chapterData);
    setCourses((prev) =>
      prev.map((c) =>
        String(c.id) === String(targetId)
          ? { ...c, chapters: [...(c.chapters || []), newChapter] }
          : c
      )
    );
    return newChapter;
  }

  async function updateCourse(courseId, courseData) {
    const updated = await api.updateCourse(courseId, courseData);
    setCourses((prev) =>
      prev.map((c) => (String(c.id) === String(courseId) ? updated : c))
    );
    return updated;
  }

  async function deleteCourse(courseId) {
    await api.deleteCourse(courseId);
    setCourses((prev) => prev.filter((c) => String(c.id) !== String(courseId)));
  }

  async function togglePublish(courseId) {
    const updated = await api.togglePublish(courseId);
    setCourses((prev) =>
      prev.map((c) => (String(c.id) === String(courseId) ? updated : c))
    );
    return updated;
  }

  async function updateChapter(courseId, chapterId, chapterData) {
    const updated = await api.updateChapter(chapterId, chapterData);
    setCourses((prev) =>
      prev.map((c) => {
        if (String(c.id) !== String(courseId)) return c;
        return {
          ...c,
          chapters: (c.chapters || []).map((ch) =>
            String(ch.id) === String(chapterId) ? { ...ch, ...updated } : ch
          ),
        };
      })
    );
    return updated;
  }

  async function deleteChapter(courseId, chapterId) {
    await api.deleteChapter(chapterId);
    setCourses((prev) =>
      prev.map((c) => {
        if (String(c.id) !== String(courseId)) return c;
        return {
          ...c,
          chapters: (c.chapters || []).filter(
            (ch) => String(ch.id) !== String(chapterId)
          ),
        };
      })
    );
  }

  async function reorderChapters(courseId, chapterOrders) {
    const reordered = await api.reorderChapters(courseId, chapterOrders);
    setCourses((prev) =>
      prev.map((c) =>
        String(c.id) === String(courseId) ? { ...c, chapters: reordered } : c
      )
    );
    return reordered;
  }

  const getAnalytics = useCallback(async () => {
    return api.getAnalytics();
  }, []);

  async function uploadFile(file, folder = "materials") {
    return api.uploadFile(file, folder);
  }

  const value = {
    courses,
    enrolledCourseIds,
    completedChapters,
    quizDone,
    quizQuestions,
    loading,
    error,
    enrollCourse,
    completeChapter,
    calculateProgress,
    submitQuiz,
    getQuizByCourse,
    createQuiz,
    updateQuiz,
    deleteQuiz,
    getQuizAttempts,
    addCourse,
    updateCourse,
    deleteCourse,
    togglePublish,
    addChapter,
    updateChapter,
    deleteChapter,
    reorderChapters,
    getAnalytics,
    uploadFile,
  };

  return <CourseContext.Provider value={value}>{children}</CourseContext.Provider>;
}
