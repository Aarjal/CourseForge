import { describe, it, expect, beforeEach } from "vitest";
import {
  getStoredStatus,
  saveStoredStatus,
  getStoredCourses,
  saveStoredCourses,
  initialStatus,
  DEFAULT_COURSES,
} from "../services/storage";

describe("Storage Service", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns initial status when nothing is stored", () => {
    const status = getStoredStatus();
    expect(status).toEqual(initialStatus);
  });

  it("saves and retrieves user status", () => {
    const customStatus = {
      loggedin: true,
      user: { email: "student@example.com", role: "student" },
      en_courses: [1],
      completed_chap: { 1: [1, 2] },
      quiz_done: true,
    };

    saveStoredStatus(customStatus);
    const retrieved = getStoredStatus();
    expect(retrieved.loggedin).toBe(true);
    expect(retrieved.user.email).toBe("student@example.com");
    expect(retrieved.en_courses).toEqual([1]);
  });

  it("returns default courses when none stored", () => {
    const courses = getStoredCourses();
    expect(courses.length).toBe(DEFAULT_COURSES.length);
    expect(courses[0].name).toBe("Intro to Web Dev");
  });

  it("saves and retrieves updated course list", () => {
    const updated = [
      ...DEFAULT_COURSES,
      { id: 99, name: "New Course", category: "Test", level: "Beginner", desc: "Test desc" },
    ];
    saveStoredCourses(updated);
    const retrieved = getStoredCourses();
    expect(retrieved.length).toBe(DEFAULT_COURSES.length + 1);
    expect(retrieved.find((c) => c.id === 99)?.name).toBe("New Course");
  });
});
