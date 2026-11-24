import { DEFAULT_QUIZ_QUESTIONS } from "../../services/storage";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_PREFIX = `${BASE_URL.replace(/\/$/, "")}/api/v1`;

const TOKEN_KEY = "courseforge-access-token";
const REFRESH_TOKEN_KEY = "courseforge-refresh-token";

function getToken() {
  return localStorage.getItem(TOKEN_KEY) || localStorage.getItem("courseforge-jwt-token");
}

function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("courseforge-jwt-token");
  }
}

function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

function setRefreshToken(token) {
  if (token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}

function clearAllTokens() {
  setToken(null);
  setRefreshToken(null);
}

let isRefreshing = false;
let failedQueue = [];

function processQueue(error, token = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
}

async function request(endpoint, options = {}) {
  const token = getToken();
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  const headers = {
    ...options.headers,
  };

  if (!isFormData && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_PREFIX}${endpoint}`, {
    ...options,
    headers,
    credentials: "include", // Include httpOnly cookies
  });

  // Handle 401 and attempt automatic token refresh
  if (
    response.status === 401 &&
    !options._retry &&
    !endpoint.startsWith("/auth/login") &&
    !endpoint.startsWith("/auth/register") &&
    !endpoint.startsWith("/auth/refresh")
  ) {
    const refreshToken = getRefreshToken();

    if (isRefreshing) {
      // Queue requests until refresh completes
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((newToken) => {
        return request(endpoint, {
          ...options,
          _retry: true,
          headers: { ...options.headers, Authorization: `Bearer ${newToken}` },
        });
      });
    }

    options._retry = true;
    isRefreshing = true;

    try {
      const refreshRes = await fetch(`${API_PREFIX}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ refreshToken }),
      });

      if (!refreshRes.ok) {
        throw new Error("Session expired. Please log in again.");
      }

      const refreshData = await refreshRes.json();
      const newAccessToken = refreshData.accessToken;
      setToken(newAccessToken);

      processQueue(null, newAccessToken);
      isRefreshing = false;

      // Retry original request with new token
      return request(endpoint, {
        ...options,
        _retry: true,
      });
    } catch (refreshErr) {
      processQueue(refreshErr, null);
      isRefreshing = false;
      clearAllTokens();
      throw refreshErr;
    }
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(
      data?.message || data?.error || `Request failed with status ${response.status}`
    );
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export function resolveMediaUrl(url) {
  if (!url) return "";
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("blob:") ||
    url.startsWith("data:")
  ) {
    return url;
  }
  return `${BASE_URL.replace(/\/$/, "")}${url.startsWith("/") ? "" : "/"}${url}`;
}

function normalizeChapter(ch, idx) {
  if (!ch) return null;
  return {
    id: ch._id || ch.id,
    title: ch.title,
    duration: typeof ch.duration === "number" ? ch.duration : parseInt(ch.duration, 10) || 15,
    preview: Boolean(ch.preview),
    type: ch.type || "Theory",
    order: ch.order || idx + 1,
    content: ch.content || "",
    videoUrl: ch.videoUrl || "",
    materials: Array.isArray(ch.materials)
      ? ch.materials.map((m) => ({
          title: m.title || "Study Material",
          url: m.url || "",
          type: m.type || "document",
          size: typeof m.size === "number" ? m.size : 0,
        }))
      : [],
  };
}

function normalizeCourse(c) {
  if (!c) return c;
  return {
    id: c._id || c.id,
    title: c.title || c.name,
    description: c.description || c.desc,
    category: c.category || "General",
    level: c.level || "Beginner",
    published: c.published !== false,
    price: typeof c.price === "number" ? c.price : 0,
    thumbnail: c.thumbnail || "",
    createdBy: c.createdBy,
    chapters: (c.chapters || []).map(normalizeChapter).filter(Boolean),
    challenge: (c.challenge || []).map((cl) => ({
      id: cl._id || cl.id,
      title: cl.title,
      duration: typeof cl.duration === "number" ? cl.duration : 30,
      preview: Boolean(cl.preview),
      type: cl.type || "Lab",
    })),
  };
}

export const httpAdapter = {
  // Course methods
  async getCourses(params = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") {
        searchParams.append(k, v);
      }
    });
    const query = searchParams.toString();
    const data = await request(`/courses${query ? `?${query}` : ""}`);
    const list = Array.isArray(data) ? data : data?.courses || [];
    return list.map(normalizeCourse);
  },

  async getCourseById(courseId) {
    const course = await request(`/courses/${courseId}`);
    return normalizeCourse(course);
  },

  async createCourse(courseData) {
    const payload = {
      title: courseData.title || courseData.name,
      description: courseData.description || courseData.desc,
      category: courseData.category || "General",
      level: courseData.level || "Beginner",
      published: courseData.published !== false,
      price: typeof courseData.price === "number" ? courseData.price : 0,
      thumbnail: courseData.thumbnail || "",
    };
    const course = await request("/courses", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return normalizeCourse(course);
  },

  async updateCourse(courseId, courseData) {
    const payload = { ...courseData };
    if (payload.name && !payload.title) payload.title = payload.name;
    if (payload.desc && !payload.description) payload.description = payload.desc;

    const course = await request(`/courses/${courseId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return normalizeCourse(course);
  },

  async deleteCourse(courseId) {
    return request(`/courses/${courseId}`, {
      method: "DELETE",
    });
  },

  async togglePublish(courseId) {
    const course = await request(`/courses/${courseId}/publish`, {
      method: "PATCH",
    });
    return normalizeCourse(course);
  },

  // Chapter methods
  async getChaptersByCourse(courseId) {
    const chapters = await request(`/courses/${courseId}/chapters`);
    return Array.isArray(chapters) ? chapters.map(normalizeChapter) : [];
  },

  async addChapter(courseId, chapterData) {
    const payload = {
      title: chapterData.title,
      duration: typeof chapterData.duration === "number" ? chapterData.duration : parseInt(chapterData.duration, 10) || 15,
      preview: Boolean(chapterData.preview),
      type: chapterData.type || "Theory",
      content: chapterData.content || "",
      videoUrl: chapterData.videoUrl || "",
      materials: Array.isArray(chapterData.materials) ? chapterData.materials : [],
    };
    if (chapterData.order) payload.order = Number(chapterData.order);

    const chapter = await request(`/courses/${courseId}/chapters`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return normalizeChapter(chapter, 0);
  },

  async updateChapter(chapterId, chapterData) {
    const chapter = await request(`/chapters/${chapterId}`, {
      method: "PUT",
      body: JSON.stringify(chapterData),
    });
    return normalizeChapter(chapter, 0);
  },

  async deleteChapter(chapterId) {
    return request(`/chapters/${chapterId}`, {
      method: "DELETE",
    });
  },

  async reorderChapters(courseId, chapterOrders) {
    const chapters = await request(`/courses/${courseId}/chapters/reorder`, {
      method: "PATCH",
      body: JSON.stringify({ chapterOrders }),
    });
    return Array.isArray(chapters) ? chapters.map(normalizeChapter) : [];
  },

  // Auth methods
  async register({ name, email, password, role }) {
    const data = await request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password, role }),
    });
    const token = data.accessToken || data.token;
    if (token) setToken(token);
    if (data.refreshToken) setRefreshToken(data.refreshToken);
    return data;
  },

  async login({ email, password }) {
    const data = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    const token = data.accessToken || data.token;
    if (token) setToken(token);
    if (data.refreshToken) setRefreshToken(data.refreshToken);
    return data;
  },

  async logout() {
    try {
      await request("/auth/logout", { method: "POST" });
    } finally {
      clearAllTokens();
    }
    return { success: true };
  },

  async getCurrentUser() {
    const token = getToken();
    if (!token) return null;

    try {
      const data = await request("/auth/me");
      return data?.user || null;
    } catch {
      clearAllTokens();
      return null;
    }
  },

  // Enrollment & Progress methods (fallback until phase 6 endpoints)
  async getEnrollments() {
    try {
      const data = await request("/enrollments");
      return data.enrolledCourseIds || [];
    } catch {
      const saved = localStorage.getItem("cf-enrolled-courses");
      return saved ? JSON.parse(saved) : [];
    }
  },

  async enroll(courseId) {
    try {
      return await request(`/enrollments/${courseId}`, { method: "POST" });
    } catch {
      const saved = localStorage.getItem("cf-enrolled-courses");
      const list = saved ? JSON.parse(saved) : [];
      if (!list.includes(String(courseId))) {
        list.push(String(courseId));
        localStorage.setItem("cf-enrolled-courses", JSON.stringify(list));
      }
      return { success: true, enrolled: list };
    }
  },

  async getProgress() {
    try {
      return await request("/progress");
    } catch {
      const saved = localStorage.getItem("cf-completed-chapters");
      return {
        completedChapters: saved ? JSON.parse(saved) : {},
        quizDone: false,
      };
    }
  },

  async completeChapter(courseId, chapterId) {
    try {
      return await request(`/progress/${courseId}/chapters/${chapterId}`, {
        method: "POST",
      });
    } catch {
      const saved = localStorage.getItem("cf-completed-chapters");
      const progress = saved ? JSON.parse(saved) : {};
      const courseChaps = progress[courseId] || [];
      if (!courseChaps.includes(String(chapterId))) {
        courseChaps.push(String(chapterId));
        progress[courseId] = courseChaps;
        localStorage.setItem("cf-completed-chapters", JSON.stringify(progress));
      }
      return { success: true, completed: courseChaps };
    }
  },

  // Quiz methods
  async getQuizQuestions() {
    try {
      return await request("/quizzes");
    } catch {
      return DEFAULT_QUIZ_QUESTIONS;
    }
  },

  async getQuizByCourse(courseId) {
    if (!courseId) return null;
    try {
      return await request(`/courses/${courseId}/quiz`);
    } catch (err) {
      if (err.status === 404) return null;
      throw err;
    }
  },

  async createQuiz(courseId, quizData) {
    return request(`/courses/${courseId}/quiz`, {
      method: "POST",
      body: JSON.stringify(quizData),
    });
  },

  async updateQuiz(courseId, quizData) {
    return request(`/courses/${courseId}/quiz`, {
      method: "PUT",
      body: JSON.stringify(quizData),
    });
  },

  async deleteQuiz(courseId) {
    return request(`/courses/${courseId}/quiz`, {
      method: "DELETE",
    });
  },

  async getQuizAttempts(courseId) {
    try {
      return await request(`/courses/${courseId}/quiz/attempts`);
    } catch {
      return [];
    }
  },

  async submitQuiz(courseIdOrAnswers, maybeAnswers) {
    let courseId = null;
    let answers = courseIdOrAnswers;
    if (maybeAnswers !== undefined) {
      courseId = courseIdOrAnswers;
      answers = maybeAnswers;
    }

    if (courseId) {
      try {
        return await request(`/courses/${courseId}/quiz/submit`, {
          method: "POST",
          body: JSON.stringify({ answers }),
        });
      } catch (err) {
        console.warn("Course quiz submission failed, attempting fallback:", err.message);
      }
    }

    try {
      return await request("/quizzes/submit", {
        method: "POST",
        body: JSON.stringify({ answers }),
      });
    } catch {
      let score = 0;
      DEFAULT_QUIZ_QUESTIONS.forEach((q, index) => {
        const sel = Array.isArray(answers) ? answers[index] : answers[index] ?? answers[String(index)];
        if (Number(sel) === q.ans) score++;
      });
      const passed = score >= Math.ceil(DEFAULT_QUIZ_QUESTIONS.length * 0.8);
      return {
        message: passed ? "Congratulations, you passed the quiz!" : "Quiz completed. You did not meet the passing score.",
        score,
        totalQuestions: DEFAULT_QUIZ_QUESTIONS.length,
        total: DEFAULT_QUIZ_QUESTIONS.length,
        percentage: Math.round((score / DEFAULT_QUIZ_QUESTIONS.length) * 100),
        passed,
        results: DEFAULT_QUIZ_QUESTIONS.map((q, idx) => {
          const sel = Number(Array.isArray(answers) ? answers[idx] : answers[idx] ?? answers[String(idx)]);
          return {
            questionIndex: idx,
            selectedOption: sel,
            isCorrect: sel === q.ans,
            correctAnswer: q.ans,
            explanation: q.explanation || "Standard answer.",
          };
        }),
      };
    }
  },

  // Analytics
  async getAnalytics() {
    return request("/analytics/overview");
  },

  // Media & Uploads
  async uploadFile(file, folder = "materials") {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    const data = await request("/uploads", {
      method: "POST",
      body: formData,
    });
    return data.file;
  },
};
