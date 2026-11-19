import {
  DEFAULT_QUIZ_QUESTIONS,
} from "../../services/storage";

const V2_COURSES_KEY = "courseforge-courses-v2";
const V1_LEGACY_KEY = "courseforge-courses";
const STATUS_KEY = "course-status";

export const STANDARDIZED_DEFAULT_COURSES = [
  {
    id: 1,
    title: "Intro to Web Dev",
    description:
      "Learn basics of web development by learning basic HTML and CSS. You will also learn how websites work and how to make your own website from scratch.",
    category: "Development",
    level: "Beginner",
    published: true,
    chapters: [
      {
        id: 1,
        title: "How web works??",
        duration: 15,
        preview: true,
        type: "Theory",
        order: 1,
      },
      {
        id: 2,
        title: "HTML foundations",
        duration: 20,
        preview: false,
        type: "Theory",
        order: 2,
      },
      {
        id: 3,
        title: "CSS foundations",
        duration: 25,
        preview: false,
        type: "Theory",
        order: 3,
      },
    ],
    challenge: [
      {
        id: 1,
        title: "Build a simple website using HTML and CSS",
        duration: 30,
        preview: false,
        type: "Lab",
      },
    ],
  },
  {
    id: 2,
    title: "JS (JavaScript) Essentials for Beginners",
    description:
      "Build strong foundation in JS variables, functions, arrays and events. You will also learn how to make your website interactive using JS.",
    category: "Programming",
    level: "Intermediate",
    published: true,
    chapters: [
      {
        id: 1,
        title: "Variables and Values",
        duration: 15,
        preview: true,
        type: "Theory",
        order: 1,
      },
      {
        id: 2,
        title: "Functions and Events",
        duration: 25,
        preview: false,
        type: "Theory",
        order: 2,
      },
      {
        id: 3,
        title: "Arrays and Loops",
        duration: 30,
        preview: false,
        type: "Theory",
        order: 3,
      },
      {
        id: 4,
        title: "Events and Interaction",
        duration: 28,
        preview: false,
        type: "Theory",
        order: 4,
      },
    ],
    challenge: [
      {
        id: 1,
        title: "Build a simple calc. using JS foundations.",
        duration: 30,
        preview: false,
        type: "Lab",
      },
      {
        id: 2,
        title: "Build a website that takes input and validates it using JS (also use HTML and CSS)",
        duration: 40,
        preview: false,
        type: "Lab",
      },
    ],
  },
];

export function migrateCourseToV2(course) {
  const durationToMinutes = (dur) => {
    if (typeof dur === "number") return dur;
    if (typeof dur === "string") {
      const parsed = parseInt(dur, 10);
      return Number.isNaN(parsed) ? 15 : parsed;
    }
    return 15;
  };

  return {
    id: course.id,
    title: course.title || course.name || "Untitled Course",
    description: course.description || course.desc || "",
    category: course.category || "Development",
    level: course.level || "Beginner",
    published: course.published !== false,
    chapters: (course.chapters || []).map((ch, idx) => ({
      id: ch.id,
      title: ch.title || `Chapter ${idx + 1}`,
      duration: durationToMinutes(ch.duration),
      preview: Boolean(ch.preview),
      type: ch.type || "Theory",
      order: ch.order || idx + 1,
    })),
    challenge: (course.challenge || []).map((cl) => ({
      id: cl.id,
      title: cl.title,
      duration: durationToMinutes(cl.duration),
      preview: Boolean(cl.preview),
      type: cl.type || "Lab",
    })),
  };
}

function loadAndMigrateCourses() {
  try {
    const v2Saved = localStorage.getItem(V2_COURSES_KEY);
    if (v2Saved) {
      return JSON.parse(v2Saved);
    }

    const legacySaved = localStorage.getItem(V1_LEGACY_KEY);
    if (legacySaved) {
      const parsedLegacy = JSON.parse(legacySaved);
      const migrated = parsedLegacy.map(migrateCourseToV2);
      localStorage.setItem(V2_COURSES_KEY, JSON.stringify(migrated));
      return migrated;
    }

    localStorage.setItem(V2_COURSES_KEY, JSON.stringify(STANDARDIZED_DEFAULT_COURSES));
    return STANDARDIZED_DEFAULT_COURSES;
  } catch {
    return STANDARDIZED_DEFAULT_COURSES;
  }
}

function saveCoursesToStorage(courses) {
  localStorage.setItem(V2_COURSES_KEY, JSON.stringify(courses));
}

function getStoredStatus() {
  try {
    const saved = localStorage.getItem(STATUS_KEY);
    return saved
      ? JSON.parse(saved)
      : {
          loggedin: false,
          user: null,
          en_courses: [],
          completed_chap: {},
          quiz_done: false,
        };
  } catch {
    return {
      loggedin: false,
      user: null,
      en_courses: [],
      completed_chap: {},
      quiz_done: false,
    };
  }
}

function saveStoredStatus(status) {
  localStorage.setItem(STATUS_KEY, JSON.stringify(status));
}

export const mockAdapter = {
  // Course methods
  async getCourses() {
    return loadAndMigrateCourses();
  },

  async getCourseById(courseId) {
    const courses = loadAndMigrateCourses();
    const found = courses.find((c) => String(c.id) === String(courseId));
    if (!found) {
      const error = new Error("Course not found");
      error.status = 404;
      throw error;
    }
    return found;
  },

  async createCourse(courseData) {
    const courses = loadAndMigrateCourses();
    const newCourse = migrateCourseToV2({
      ...courseData,
      id: Date.now(),
      chapters: courseData.chapters || [],
      challenge: courseData.challenge || [],
    });
    const updated = [...courses, newCourse];
    saveCoursesToStorage(updated);
    return newCourse;
  },

  async updateCourse(courseId, courseData) {
    const courses = loadAndMigrateCourses();
    const index = courses.findIndex((c) => String(c.id) === String(courseId));
    if (index === -1) {
      const error = new Error("Course not found");
      error.status = 404;
      throw error;
    }
    const updatedCourse = migrateCourseToV2({
      ...courses[index],
      ...courseData,
      id: courses[index].id,
    });
    courses[index] = updatedCourse;
    saveCoursesToStorage(courses);
    return updatedCourse;
  },

  async deleteCourse(courseId) {
    const courses = loadAndMigrateCourses();
    const filtered = courses.filter((c) => String(c.id) !== String(courseId));
    saveCoursesToStorage(filtered);
    return { success: true };
  },

  async togglePublish(courseId) {
    const courses = loadAndMigrateCourses();
    const index = courses.findIndex((c) => String(c.id) === String(courseId));
    if (index === -1) {
      const error = new Error("Course not found");
      error.status = 404;
      throw error;
    }
    courses[index].published = !courses[index].published;
    saveCoursesToStorage(courses);
    return courses[index];
  },

  async updateChapter(courseId, chapterId, chapterData) {
    const courses = loadAndMigrateCourses();
    const courseIndex = courses.findIndex((c) => String(c.id) === String(courseId));
    if (courseIndex === -1) throw new Error("Course not found");

    const chapters = courses[courseIndex].chapters || [];
    const chIndex = chapters.findIndex((ch) => String(ch.id) === String(chapterId));
    if (chIndex === -1) throw new Error("Chapter not found");

    chapters[chIndex] = {
      ...chapters[chIndex],
      ...chapterData,
      duration:
        typeof chapterData.duration === "number"
          ? chapterData.duration
          : parseInt(chapterData.duration, 10) || chapters[chIndex].duration,
    };
    courses[courseIndex].chapters = chapters;
    saveCoursesToStorage(courses);
    return chapters[chIndex];
  },

  async deleteChapter(courseId, chapterId) {
    const courses = loadAndMigrateCourses();
    const courseIndex = courses.findIndex((c) => String(c.id) === String(courseId));
    if (courseIndex === -1) throw new Error("Course not found");

    courses[courseIndex].chapters = (courses[courseIndex].chapters || []).filter(
      (ch) => String(ch.id) !== String(chapterId)
    );
    saveCoursesToStorage(courses);
    return { success: true };
  },

  async reorderChapters(courseId, chapterOrders) {
    const courses = loadAndMigrateCourses();
    const courseIndex = courses.findIndex((c) => String(c.id) === String(courseId));
    if (courseIndex === -1) throw new Error("Course not found");

    const orderMap = {};
    chapterOrders.forEach((o) => {
      orderMap[String(o.id)] = o.order;
    });

    courses[courseIndex].chapters = (courses[courseIndex].chapters || [])
      .map((ch) => ({
        ...ch,
        order: orderMap[String(ch.id)] !== undefined ? orderMap[String(ch.id)] : ch.order,
      }))
      .sort((a, b) => a.order - b.order);

    saveCoursesToStorage(courses);
    return courses[courseIndex].chapters;
  },

  async addChapter(courseId, chapterData) {
    const courses = loadAndMigrateCourses();
    const index = courses.findIndex((c) => String(c.id) === String(courseId));
    if (index === -1) {
      const error = new Error("Course not found");
      error.status = 404;
      throw error;
    }

    const course = courses[index];
    const existingChapters = course.chapters || [];
    const nextId =
      existingChapters.reduce((max, ch) => Math.max(max, Number(ch.id)), 0) + 1;

    const newChapter = {
      id: nextId,
      title: chapterData.title,
      duration:
        typeof chapterData.duration === "number"
          ? chapterData.duration
          : parseInt(chapterData.duration, 10) || 15,
      preview: Boolean(chapterData.preview),
      type: chapterData.type || "Theory",
      order: existingChapters.length + 1,
    };

    course.chapters = [...existingChapters, newChapter];
    courses[index] = course;
    saveCoursesToStorage(courses);
    return newChapter;
  },

  // Auth methods
  async register({ name, email, password, role = "student" }) {
    if (!email || !password) {
      throw new Error("Email and password are required");
    }
    const userRole = email.includes("admin") ? "admin" : role;
    const user = { id: Date.now(), name: name || "Student", email, role: userRole };
    const status = getStoredStatus();
    saveStoredStatus({ ...status, loggedin: true, user });
    return { user, token: "mock-jwt-token" };
  },

  async login({ email, password }) {
    if (!email || !password) {
      throw new Error("Email and password are required");
    }
    const role = email.includes("admin") ? "admin" : "student";
    const user = { email, role };
    const status = getStoredStatus();
    saveStoredStatus({ ...status, loggedin: true, user });
    return { user, token: "mock-jwt-token" };
  },

  async logout() {
    const status = getStoredStatus();
    saveStoredStatus({ ...status, loggedin: false, user: null });
    return { success: true };
  },

  async getCurrentUser() {
    const status = getStoredStatus();
    return status.loggedin ? status.user : null;
  },

  // Enrollment & Progress methods
  async getEnrollments() {
    const status = getStoredStatus();
    return status.en_courses || [];
  },

  async enroll(courseId) {
    const numericId = Number(courseId);
    const status = getStoredStatus();
    const enrolled = status.en_courses || [];
    if (!enrolled.includes(numericId)) {
      const next = { ...status, en_courses: [...enrolled, numericId] };
      saveStoredStatus(next);
      return { success: true, enrolled: next.en_courses };
    }
    return { success: true, enrolled };
  },

  async getProgress() {
    const status = getStoredStatus();
    return {
      completedChapters: status.completed_chap || {},
      quizDone: Boolean(status.quiz_done),
    };
  },

  async completeChapter(courseId, chapterId) {
    const numericCourseId = Number(courseId);
    const numericChapId = Number(chapterId);
    const status = getStoredStatus();
    const currentCompleted = status.completed_chap[numericCourseId] || [];

    if (!currentCompleted.includes(numericChapId)) {
      const nextCompleted = [...currentCompleted, numericChapId];
      const next = {
        ...status,
        completed_chap: {
          ...status.completed_chap,
          [numericCourseId]: nextCompleted,
        },
      };
      saveStoredStatus(next);
      return { success: true, completed: nextCompleted };
    }
    return { success: true, completed: currentCompleted };
  },

  // Quiz methods
  async getQuizQuestions() {
    return DEFAULT_QUIZ_QUESTIONS;
  },

  async submitQuiz(answers) {
    let score = 0;
    DEFAULT_QUIZ_QUESTIONS.forEach((q, index) => {
      if (Number(answers[index]) === q.ans) {
        score++;
      }
    });

    const status = getStoredStatus();
    if (score === DEFAULT_QUIZ_QUESTIONS.length) {
      saveStoredStatus({ ...status, quiz_done: true });
    }

    return { score, total: DEFAULT_QUIZ_QUESTIONS.length, passed: score === DEFAULT_QUIZ_QUESTIONS.length };
  },

  // Analytics
  async getAnalytics() {
    const courses = loadAndMigrateCourses();
    const status = getStoredStatus();
    const enrolled = status.en_courses || [];
    const completedMap = status.completed_chap || {};

    const courseStats = courses.map((c) => {
      const isEnrolled = enrolled.includes(Number(c.id));
      const chapCount = (c.chapters || []).length;
      const completedChaps = completedMap[c.id] || [];
      const isComplete = chapCount > 0 && completedChaps.length >= chapCount;

      return {
        id: c.id,
        title: c.title,
        published: c.published !== false,
        price: c.price || 0,
        enrollmentsCount: isEnrolled ? 1 : 0,
        completionsCount: isComplete ? 1 : 0,
        completionRate: isEnrolled ? (isComplete ? 100 : Math.round((completedChaps.length / chapCount) * 100)) : 0,
      };
    });

    const totalPublished = courses.filter((c) => c.published !== false).length;
    return {
      summary: {
        totalCourses: courses.length,
        publishedCourses: totalPublished,
        draftCourses: courses.length - totalPublished,
        totalStudents: enrolled.length > 0 ? 1 : 0,
        totalEnrollments: enrolled.length,
        totalCompletions: courseStats.filter((c) => c.completionsCount > 0).length,
      },
      courses: courseStats,
      recentEnrollments: enrolled.map((courseId) => {
        const found = courses.find((c) => String(c.id) === String(courseId));
        return {
          id: `enr-${courseId}`,
          user: status.user || { name: "Demo Student", email: "student@demo.local" },
          course: { id: courseId, title: found?.title || `Course ${courseId}` },
          enrolledAt: new Date().toISOString(),
        };
      }),
    };
  },
};
