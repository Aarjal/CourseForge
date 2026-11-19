import { describe, it, expect, beforeEach } from "vitest";
import { mockAdapter } from "../api/adapters/mockAdapter";

describe("Admin & Instructor Methods (mockAdapter)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("toggles course publish status", async () => {
    const courses = await mockAdapter.getCourses();
    const courseId = courses[0].id;
    const initialStatus = courses[0].published;

    const toggled = await mockAdapter.togglePublish(courseId);
    expect(toggled.published).toBe(!initialStatus);

    const reToggled = await mockAdapter.togglePublish(courseId);
    expect(reToggled.published).toBe(initialStatus);
  });

  it("reorders chapters in a course", async () => {
    const courses = await mockAdapter.getCourses();
    const course = courses[0];
    expect(course.chapters.length).toBeGreaterThan(1);

    const firstChapter = course.chapters[0];
    const secondChapter = course.chapters[1];

    // Swap order
    const updatedChapters = await mockAdapter.reorderChapters(course.id, [
      { id: firstChapter.id, order: 2 },
      { id: secondChapter.id, order: 1 },
    ]);

    expect(updatedChapters[0].id).toBe(secondChapter.id);
    expect(updatedChapters[0].order).toBe(1);
    expect(updatedChapters[1].id).toBe(firstChapter.id);
    expect(updatedChapters[1].order).toBe(2);
  });

  it("computes analytics summary and course performance breakdown", async () => {
    const analytics = await mockAdapter.getAnalytics();

    expect(analytics.summary).toBeDefined();
    expect(analytics.summary.totalCourses).toBeGreaterThan(0);
    expect(analytics.summary.publishedCourses).toBeDefined();
    expect(analytics.courses).toBeDefined();
    expect(Array.isArray(analytics.courses)).toBe(true);
    expect(analytics.courses[0].title).toBeDefined();
    expect(analytics.courses[0].completionRate).toBeDefined();
  });
});
