import {
  DEFAULT_QUIZ_QUESTIONS,
} from "../../services/storage";

const V2_COURSES_KEY = "courseforge-courses-v2";
const V1_LEGACY_KEY = "courseforge-courses";
const STATUS_KEY = "course-status";
const V2_QUIZZES_KEY = "courseforge-quizzes-v1";
const V2_ATTEMPTS_KEY = "courseforge-quiz-attempts-v1";
const V2_USERS_KEY = "courseforge-mock-users-v1";

function loadMockUsers() {
  try {
    const raw = localStorage.getItem(V2_USERS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveMockUsers(users) {
  try {
    localStorage.setItem(V2_USERS_KEY, JSON.stringify(users));
  } catch {}
}

function loadStoredQuizzes() {
  try {
    const raw = localStorage.getItem(V2_QUIZZES_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveStoredQuizzes(quizzes) {
  try {
    localStorage.setItem(V2_QUIZZES_KEY, JSON.stringify(quizzes));
  } catch {}
}

function loadStoredAttempts() {
  try {
    const raw = localStorage.getItem(V2_ATTEMPTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveStoredAttempts(attempts) {
  try {
    localStorage.setItem(V2_ATTEMPTS_KEY, JSON.stringify(attempts));
  } catch {}
}

function getDefaultQuizForCourse(courseId) {
  return {
    id: `quiz-${courseId}`,
    course: String(courseId),
    title: "Web Development Basics Quiz",
    description: "Test your comprehension of HTML, CSS, JavaScript, and web fundamentals.",
    passingScore: 80,
    questions: DEFAULT_QUIZ_QUESTIONS.map((q, idx) => ({
      id: `q-${idx + 1}`,
      question: q.question,
      options: q.options,
      correctAnswer: q.ans,
      explanation:
        q.ans === 0
          ? "HTML is the standard markup language for creating web page structure."
          : q.ans === 2
          ? "JavaScript provides dynamic, interactive scripting in the browser."
          : "CSS handles layout and visual styling.",
    })),
  };
}

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
    thumbnail: course.thumbnail || "",
    chapters: (course.chapters || []).map((ch, idx) => ({
      id: ch.id,
      title: ch.title || `Chapter ${idx + 1}`,
      duration: durationToMinutes(ch.duration),
      preview: Boolean(ch.preview),
      type: ch.type || "Theory",
      order: ch.order || idx + 1,
      videoUrl: ch.videoUrl || "",
      materials: Array.isArray(ch.materials) ? ch.materials : [],
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
      videoUrl: chapterData.videoUrl || "",
      materials: Array.isArray(chapterData.materials) ? chapterData.materials : [],
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
    const cleanEmail = email.trim().toLowerCase();
    const users = loadMockUsers();
    const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      throw new Error("User with this email already exists");
    }
    const userRole = cleanEmail.includes("admin") ? "admin" : role;
    const displayName = name && name.trim() ? name.trim() : (cleanEmail.split("@")[0] || "Student");
    const newUser = {
      id: `usr-${Date.now()}`,
      name: displayName,
      email: cleanEmail,
      password,
      role: userRole,
    };
    users.push(newUser);
    saveMockUsers(users);

    const publicUser = { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role };
    const status = getStoredStatus();
    saveStoredStatus({ ...status, loggedin: true, user: publicUser });
    return { user: publicUser, token: "mock-jwt-token" };
  },

  async login({ email, password }) {
    if (!email || !password) {
      throw new Error("Email and password are required");
    }
    const cleanEmail = email.trim().toLowerCase();
    const users = loadMockUsers();
    let found = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (found) {
      if (found.password && found.password !== password) {
        throw new Error("Invalid email or password");
      }
    } else {
      const role = cleanEmail.includes("admin") ? "admin" : "student";
      const rawPrefix = cleanEmail.split("@")[0] || "Student";
      const displayName = rawPrefix.charAt(0).toUpperCase() + rawPrefix.slice(1);
      found = { id: `usr-${Date.now()}`, name: displayName, email: cleanEmail, password, role };
      users.push(found);
      saveMockUsers(users);
    }

    const publicUser = { id: found.id, name: found.name, email: found.email, role: found.role };
    const status = getStoredStatus();
    saveStoredStatus({ ...status, loggedin: true, user: publicUser });
    return { user: publicUser, token: "mock-jwt-token" };
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

  async getQuizByCourse(courseId) {
    if (!courseId) return null;
    const quizzes = loadStoredQuizzes();
    let found = quizzes.find((q) => String(q.course) === String(courseId));
    if (!found && String(courseId) === "1") {
      found = getDefaultQuizForCourse("1");
      quizzes.push(found);
      saveStoredQuizzes(quizzes);
    }
    return found || null;
  },

  async createQuiz(courseId, quizData) {
    const quizzes = loadStoredQuizzes();
    const existingIndex = quizzes.findIndex((q) => String(q.course) === String(courseId));
    const newQuiz = {
      id: `quiz-${courseId}-${Date.now()}`,
      course: String(courseId),
      title: quizData.title || "Course Assessment",
      description: quizData.description || "",
      passingScore: quizData.passingScore || 80,
      questions: (quizData.questions || []).map((q, idx) => ({
        id: q.id || `q-${idx + 1}`,
        question: q.question,
        options: q.options || [],
        correctAnswer: q.correctAnswer !== undefined ? Number(q.correctAnswer) : 0,
        explanation: q.explanation || "",
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    if (existingIndex >= 0) {
      quizzes[existingIndex] = newQuiz;
    } else {
      quizzes.push(newQuiz);
    }
    saveStoredQuizzes(quizzes);
    return newQuiz;
  },

  async updateQuiz(courseId, quizData) {
    const quizzes = loadStoredQuizzes();
    let index = quizzes.findIndex((q) => String(q.course) === String(courseId));
    if (index === -1) {
      if (String(courseId) === "1") {
        quizzes.push(getDefaultQuizForCourse("1"));
        index = quizzes.length - 1;
      } else {
        const error = new Error("No quiz found for this course");
        error.status = 404;
        throw error;
      }
    }
    const current = quizzes[index];
    const updated = {
      ...current,
      title: quizData.title ?? current.title,
      description: quizData.description ?? current.description,
      passingScore: quizData.passingScore ?? current.passingScore,
      questions: quizData.questions
        ? quizData.questions.map((q, idx) => ({
            id: q.id || `q-${idx + 1}`,
            question: q.question,
            options: q.options || [],
            correctAnswer: q.correctAnswer !== undefined ? Number(q.correctAnswer) : 0,
            explanation: q.explanation || "",
          }))
        : current.questions,
      updatedAt: new Date().toISOString(),
    };
    quizzes[index] = updated;
    saveStoredQuizzes(quizzes);
    return updated;
  },

  async deleteQuiz(courseId) {
    const quizzes = loadStoredQuizzes();
    const filtered = quizzes.filter((q) => String(q.course) !== String(courseId));
    saveStoredQuizzes(filtered);
    return { success: true, message: "Quiz deleted successfully" };
  },

  async getQuizAttempts(courseId) {
    const attempts = loadStoredAttempts();
    return attempts.filter((a) => String(a.course) === String(courseId));
  },

  async submitQuiz(courseIdOrAnswers, maybeAnswers) {
    let courseId = null;
    let rawAnswers = courseIdOrAnswers;
    if (maybeAnswers !== undefined) {
      courseId = courseIdOrAnswers;
      rawAnswers = maybeAnswers;
    }

    let quiz = null;
    if (courseId) {
      quiz = await this.getQuizByCourse(courseId);
    }

    const questions = quiz
      ? quiz.questions
      : DEFAULT_QUIZ_QUESTIONS.map((q) => ({
          question: q.question,
          options: q.options,
          correctAnswer: q.ans,
          explanation: q.explanation || "",
        }));
    const passingScore = quiz ? quiz.passingScore || 80 : 80;

    let score = 0;
    const totalQuestions = questions.length;
    const answersDetail = questions.map((q, idx) => {
      let selected;
      if (Array.isArray(rawAnswers)) {
        selected = rawAnswers[idx];
      } else if (rawAnswers && typeof rawAnswers === "object") {
        selected = rawAnswers[idx] !== undefined ? rawAnswers[idx] : rawAnswers[String(idx)];
      }
      const selectedIndex = selected !== undefined && selected !== null ? Number(selected) : -1;
      const isCorrect = selectedIndex === (q.correctAnswer ?? q.ans);
      if (isCorrect) score++;
      return {
        questionIndex: idx,
        selectedOption: selectedIndex,
        isCorrect,
        correctAnswer: q.correctAnswer ?? q.ans,
        explanation: q.explanation || "",
      };
    });

    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
    const passed = percentage >= passingScore;

    if (passed) {
      const status = getStoredStatus();
      saveStoredStatus({ ...status, quiz_done: true });
    }

    const attempt = {
      id: `att-${Date.now()}`,
      course: courseId ? String(courseId) : null,
      score,
      totalQuestions,
      percentage,
      passed,
      createdAt: new Date().toISOString(),
    };
    const attempts = loadStoredAttempts();
    attempts.unshift(attempt);
    saveStoredAttempts(attempts);

    return {
      message: passed
        ? "Congratulations, you passed the quiz!"
        : "Quiz completed. You did not meet the passing score.",
      score,
      totalQuestions,
      total: totalQuestions,
      percentage,
      passed,
      attemptId: attempt.id,
      results: answersDetail,
    };
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

  // Media & Uploads (Mock fallback)
  async uploadFile(file) {
    const mockUrl =
      typeof URL !== "undefined" && URL.createObjectURL
        ? URL.createObjectURL(file)
        : `/uploads/mock-${file.name}`;
    return {
      url: mockUrl,
      filename: `mock-${Date.now()}-${file.name}`,
      originalName: file.name,
      size: file.size,
      mimetype: file.type || "application/octet-stream",
    };
  },
};
