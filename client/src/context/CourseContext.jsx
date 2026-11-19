import { useState } from "react";
import { CourseContext } from "./courseContextDef";
import { useAuth } from "../hooks/useAuth";
import {
  DEFAULT_QUIZ_QUESTIONS,
  getStoredCourses,
  saveStoredCourses,
  saveStoredStatus,
} from "../services/storage";

export function CourseProvider({ children }) {
  const { authStatus, setAuthStatus } = useAuth();
  const [courses, setCourses] = useState(() => getStoredCourses());

  function updateCourses(nextCourses) {
    setCourses(nextCourses);
    saveStoredCourses(nextCourses);
  }

  function enrollCourse(courseId) {
    const numericId = Number(courseId);
    if (authStatus.en_courses.includes(numericId)) {
      return;
    }
    const nextStatus = {
      ...authStatus,
      en_courses: [...authStatus.en_courses, numericId],
    };
    setAuthStatus(nextStatus);
    saveStoredStatus(nextStatus);
  }

  function completeChapter(courseId, chapterId) {
    const numericCourseId = Number(courseId);
    const numericChapId = Number(chapterId);
    const currentCompleted = authStatus.completed_chap[numericCourseId] || [];

    if (currentCompleted.includes(numericChapId)) {
      return;
    }

    const nextStatus = {
      ...authStatus,
      completed_chap: {
        ...authStatus.completed_chap,
        [numericCourseId]: [...currentCompleted, numericChapId],
      },
    };
    setAuthStatus(nextStatus);
    saveStoredStatus(nextStatus);
  }

  function calculateProgress(course) {
    if (!course || !course.chapters || course.chapters.length === 0) {
      return 0;
    }
    const completedCount = authStatus.completed_chap[course.id]?.length || 0;
    return Math.round((completedCount / course.chapters.length) * 100);
  }

  function submitQuiz(answers) {
    let score = 0;
    DEFAULT_QUIZ_QUESTIONS.forEach((q, index) => {
      if (Number(answers[index]) === q.ans) {
        score++;
      }
    });

    if (score === DEFAULT_QUIZ_QUESTIONS.length) {
      const nextStatus = { ...authStatus, quiz_done: true };
      setAuthStatus(nextStatus);
      saveStoredStatus(nextStatus);
    }

    return score;
  }

  function addCourse(courseData) {
    const newCourse = {
      id: Date.now(),
      ...courseData,
      chapters: courseData.chapters || [],
      challenge: courseData.challenge || [],
    };
    const nextCourses = [...courses, newCourse];
    updateCourses(nextCourses);
    return newCourse;
  }

  function addChapter(targetId, chapterData) {
    if (targetId === "new") {
      return chapterData;
    }

    const numericTargetId = Number(targetId);
    const updatedCourses = courses.map((course) => {
      if (course.id !== numericTargetId) {
        return course;
      }

      const existingChapters = course.chapters || [];
      const nextId =
        existingChapters.reduce(
          (highest, ch) => Math.max(highest, Number(ch.id)),
          0
        ) + 1;

      return {
        ...course,
        chapters: [
          ...existingChapters,
          {
            ...chapterData,
            id: nextId,
          },
        ],
      };
    });

    updateCourses(updatedCourses);
  }

  const value = {
    courses,
    enrolledCourseIds: authStatus.en_courses || [],
    completedChapters: authStatus.completed_chap || {},
    quizDone: Boolean(authStatus.quiz_done),
    quizQuestions: DEFAULT_QUIZ_QUESTIONS,
    enrollCourse,
    completeChapter,
    calculateProgress,
    submitQuiz,
    addCourse,
    addChapter,
    updateCourses,
  };

  return <CourseContext.Provider value={value}>{children}</CourseContext.Provider>;
}
