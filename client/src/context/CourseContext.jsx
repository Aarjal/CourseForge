import { useState, useEffect } from "react";
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

  useEffect(() => {
    let isCancelled = false;

    async function loadData() {
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
      } catch (error) {
        if (!isCancelled) {
          console.error("Failed to fetch course data:", error);
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
    const numericId = Number(courseId);
    if (enrolledCourseIds.includes(numericId)) {
      return;
    }
    await api.enroll(numericId);
    setEnrolledCourseIds((prev) => [...prev, numericId]);
  }

  async function completeChapter(courseId, chapterId) {
    const numericCourseId = Number(courseId);
    const numericChapId = Number(chapterId);
    const currentCompleted = completedChapters[numericCourseId] || [];

    if (currentCompleted.includes(numericChapId)) {
      return;
    }

    await api.completeChapter(numericCourseId, numericChapId);
    setCompletedChapters((prev) => ({
      ...prev,
      [numericCourseId]: [...currentCompleted, numericChapId],
    }));
  }

  function calculateProgress(course) {
    if (!course || !course.chapters || course.chapters.length === 0) {
      return 0;
    }
    const completedCount = completedChapters[course.id]?.length || 0;
    return Math.round((completedCount / course.chapters.length) * 100);
  }

  async function submitQuiz(answers) {
    const result = await api.submitQuiz(answers);
    if (result.passed) {
      setQuizDone(true);
    }
    return result.score;
  }

  async function addCourse(courseData) {
    const created = await api.createCourse(courseData);
    setCourses((prev) => [...prev, created]);
    return created;
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

  const value = {
    courses,
    enrolledCourseIds,
    completedChapters,
    quizDone,
    quizQuestions,
    loading,
    enrollCourse,
    completeChapter,
    calculateProgress,
    submitQuiz,
    addCourse,
    addChapter,
  };

  return <CourseContext.Provider value={value}>{children}</CourseContext.Provider>;
}
