import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { httpAdapter } from "../api/adapters/httpAdapter";

describe("HTTP Adapter (/api/v1)", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("unwraps paginated course response and normalizes fields", async () => {
    const mockApiResponse = {
      courses: [
        {
          _id: "course-123",
          title: "Fullstack Architecture",
          description: "Learn Node and React",
          category: "Engineering",
          level: "Intermediate",
          price: 49.99,
          chapters: [
            {
              _id: "chap-1",
              title: "Getting Started",
              duration: 20,
              preview: true,
              order: 1,
            },
          ],
        },
      ],
      total: 1,
      page: 1,
      totalPages: 1,
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockApiResponse,
    });

    const courses = await httpAdapter.getCourses();

    expect(courses).toHaveLength(1);
    expect(courses[0].id).toBe("course-123");
    expect(courses[0].title).toBe("Fullstack Architecture");
    expect(courses[0].price).toBe(49.99);
    expect(courses[0].chapters).toHaveLength(1);
    expect(courses[0].chapters[0].id).toBe("chap-1");
  });

  it("stores access token and refresh token on login", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        user: { id: "u-1", name: "Alice", email: "alice@example.com", role: "student" },
        accessToken: "mock-access-token-xyz",
        refreshToken: "mock-refresh-token-abc",
      }),
    });

    const res = await httpAdapter.login({ email: "alice@example.com", password: "secret" });

    expect(res.user.email).toBe("alice@example.com");
    expect(localStorage.getItem("courseforge-access-token")).toBe("mock-access-token-xyz");
    expect(localStorage.getItem("courseforge-refresh-token")).toBe("mock-refresh-token-abc");
  });

  it("clears tokens on logout", async () => {
    localStorage.setItem("courseforge-access-token", "some-token");
    localStorage.setItem("courseforge-refresh-token", "some-refresh-token");

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ message: "Logged out" }),
    });

    await httpAdapter.logout();

    expect(localStorage.getItem("courseforge-access-token")).toBeNull();
    expect(localStorage.getItem("courseforge-refresh-token")).toBeNull();
  });

  it("attempts token refresh on 401 response and retries request", async () => {
    localStorage.setItem("courseforge-access-token", "expired-token");
    localStorage.setItem("courseforge-refresh-token", "valid-refresh-token");

    let callCount = 0;
    global.fetch = vi.fn().mockImplementation((url) => {
      callCount++;
      // First call to /courses fails with 401
      if (callCount === 1) {
        return Promise.resolve({
          ok: false,
          status: 401,
          json: async () => ({ error: "Unauthorized", message: "Token expired" }),
        });
      }
      // Second call to /auth/refresh succeeds with new token
      if (url.includes("/auth/refresh")) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ accessToken: "fresh-access-token" }),
        });
      }
      // Third call (retried /courses) succeeds
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => ({ courses: [] }),
      });
    });

    const courses = await httpAdapter.getCourses();

    expect(courses).toEqual([]);
    expect(localStorage.getItem("courseforge-access-token")).toBe("fresh-access-token");
    expect(callCount).toBe(3);
  });

  it("uploads files via FormData and normalizes media fields", async () => {
    localStorage.setItem("courseforge-access-token", "valid-token");

    global.fetch = vi.fn().mockImplementation((url, options) => {
      expect(url).toContain("/api/v1/uploads");
      expect(options.method).toBe("POST");
      expect(options.headers.Authorization).toBe("Bearer valid-token");
      expect(options.headers["Content-Type"]).toBeUndefined(); // Browser sets multipart boundary
      expect(options.body instanceof FormData).toBe(true);

      return Promise.resolve({
        ok: true,
        status: 201,
        json: async () => ({
          file: {
            url: "/uploads/sample-lecture.pdf",
            filename: "sample-lecture.pdf",
            size: 51200,
            mimetype: "application/pdf",
          },
        }),
      });
    });

    const file = new File(["dummy content"], "lecture.pdf", { type: "application/pdf" });
    const uploaded = await httpAdapter.uploadFile(file, "documents");

    expect(uploaded.url).toBe("/uploads/sample-lecture.pdf");
    expect(uploaded.size).toBe(51200);
  });

  it("preserves thumbnail, videoUrl, and materials during normalization", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        _id: "c-media",
        title: "Multimedia Design",
        description: "Audio & video production",
        thumbnail: "/uploads/thumb.png",
        chapters: [
          {
            _id: "ch-media-1",
            title: "Audio Mixing",
            duration: 30,
            preview: true,
            videoUrl: "/uploads/video.mp4",
            materials: [
              {
                title: "Mixing Cheat Sheet",
                url: "/uploads/cheatsheet.pdf",
                type: "application/pdf",
                size: 2048,
              },
            ],
          },
        ],
      }),
    });

    const course = await httpAdapter.getCourseById("c-media");
    expect(course.thumbnail).toBe("/uploads/thumb.png");
    expect(course.chapters[0].videoUrl).toBe("/uploads/video.mp4");
    expect(course.chapters[0].materials).toHaveLength(1);
    expect(course.chapters[0].materials[0].title).toBe("Mixing Cheat Sheet");
  });
});
