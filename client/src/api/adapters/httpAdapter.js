const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_PREFIX = `${BASE_URL.replace(/\/$/, "")}/api/v1`;

function getToken() {
  return localStorage.getItem("courseforge-jwt-token");
}

function setToken(token) {
  if (token) {
    localStorage.setItem("courseforge-jwt-token", token);
  } else {
    localStorage.removeItem("courseforge-jwt-token");
  }
}

async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_PREFIX}${endpoint}`, {
    ...options,
    headers,
    credentials: "include", // Supports httpOnly cookies if used
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(data?.message || data?.error || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

function normalizeCourse(c) {
  if (!c) return c;
  return {
    id: c._id || c.id,
    title: c.title || c.name,
    description: c.description || c.desc,
    category: c.category,
    level: c.level,
    published: c.published !== false,
    chapters: (c.chapters || []).map((ch, idx) => ({
      id: ch._id || ch.id,
      title: ch.title,
      duration: typeof ch.duration === "number" ? ch.duration : parseInt(ch.duration, 10) || 15,
      preview: Boolean(ch.preview),
      type: ch.type || "Theory",
      order: ch.order || idx + 1,
    })),
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
  async getCourses() {
    const courses = await request("/courses");
    return Array.isArray(courses) ? courses.map(normalizeCourse) : [];
  },

  async getCourseById(courseId) {
    const course = await request(`/courses/${courseId}`);
    return normalizeCourse(course);
  },

  async createCourse(courseData) {
    const course = await request("/courses", {
      method: "POST",
      body: JSON.stringify(courseData),
    });
    return normalizeCourse(course);
  },

  async updateCourse(courseId, courseData) {
    const course = await request(`/courses/${courseId}`, {
      method: "PUT",
      body: JSON.stringify(courseData),
    });
    return normalizeCourse(course);
  },

  async deleteCourse(courseId) {
    return request(`/courses/${courseId}`, {
      method: "DELETE",
    });
  },

  async addChapter(courseId, chapterData) {
    return request(`/courses/${courseId}/chapters`, {
      method: "POST",
      body: JSON.stringify(chapterData),
    });
  },

  // Auth methods
  async login({ email, password }) {
    const data = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (data.token) {
      setToken(data.token);
    }
    return data;
  },

  async logout() {
    try {
      await request("/auth/logout", { method: "POST" });
    } finally {
      setToken(null);
    }
    return { success: true };
  },

  async getCurrentUser() {
    return request("/auth/me");
  },

  // Enrollment & Progress methods
  async getEnrollments() {
    const data = await request("/enrollments");
    return data.enrolledCourseIds || [];
  },

  async enroll(courseId) {
    return request(`/enrollments/${courseId}`, {
      method: "POST",
    });
  },

  async getProgress() {
    return request("/progress");
  },

  async completeChapter(courseId, chapterId) {
    return request(`/progress/${courseId}/chapters/${chapterId}`, {
      method: "POST",
    });
  },

  // Quiz methods
  async getQuizQuestions() {
    return request("/quizzes");
  },

  async submitQuiz(answers) {
    return request("/quizzes/submit", {
      method: "POST",
      body: JSON.stringify({ answers }),
    });
  },
};
