import { describe, it, expect, beforeEach } from "vitest";
import { mockAdapter, migrateCourseToV2 } from "../api/adapters/mockAdapter";

describe("Mock Adapter & Data Migration", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("migrates legacy v1 course format to standardized v2 format", () => {
    const legacy = {
      id: 10,
      name: "Legacy Course",
      desc: "Old style description",
      category: "Design",
      level: "Beginner",
      chapters: [
        { id: 1, title: "Intro", duration: "25 mins", preview: true },
        { id: 2, title: "Advanced", duration: "45 mins", preview: false },
      ],
      challenge: [{ id: 1, title: "Lab 1", duration: "60 mins" }],
    };

    const migrated = migrateCourseToV2(legacy);
    expect(migrated.title).toBe("Legacy Course");
    expect(migrated.description).toBe("Old style description");
    expect(migrated.chapters[0].duration).toBe(25);
    expect(migrated.chapters[1].duration).toBe(45);
    expect(migrated.chapters[0].order).toBe(1);
    expect(migrated.challenge[0].duration).toBe(60);
  });

  it("loads default standardized courses when storage is empty", async () => {
    const courses = await mockAdapter.getCourses();
    expect(courses.length).toBeGreaterThanOrEqual(2);
    expect(courses[0].title).toBe("Intro to Web Dev");
    expect(typeof courses[0].chapters[0].duration).toBe("number");
  });

  it("migrates legacy localStorage data seamlessly on first getCourses() call", async () => {
    const legacyList = [
      {
        id: 77,
        name: "Old Stored Course",
        desc: "Stored previously in v1",
        category: "Dev",
        level: "Beginner",
        chapters: [{ id: 1, title: "Chap 1", duration: "12 mins" }],
      },
    ];
    localStorage.setItem("courseforge-courses", JSON.stringify(legacyList));

    const courses = await mockAdapter.getCourses();
    expect(courses.length).toBe(1);
    expect(courses[0].title).toBe("Old Stored Course");
    expect(courses[0].chapters[0].duration).toBe(12);

    // Verify written to v2 key
    const v2Data = JSON.parse(localStorage.getItem("courseforge-courses-v2"));
    expect(v2Data[0].title).toBe("Old Stored Course");
  });

  it("supports full course lifecycle: getById, create, addChapter, delete", async () => {
    const created = await mockAdapter.createCourse({
      title: "Fullstack Architecture",
      description: "Clean architecture in Node and React",
      category: "Architecture",
      level: "Advanced",
    });

    expect(created.id).toBeDefined();
    expect(created.title).toBe("Fullstack Architecture");

    const fetched = await mockAdapter.getCourseById(created.id);
    expect(fetched.title).toBe("Fullstack Architecture");

    const addedChapter = await mockAdapter.addChapter(created.id, {
      title: "Domain Driven Design",
      duration: 35,
      preview: true,
    });
    expect(addedChapter.title).toBe("Domain Driven Design");
    expect(addedChapter.duration).toBe(35);

    const updated = await mockAdapter.getCourseById(created.id);
    expect(updated.chapters.length).toBe(1);

    await mockAdapter.deleteCourse(created.id);
    await expect(mockAdapter.getCourseById(created.id)).rejects.toThrow("Course not found");
  });

  it("tracks enrollment and chapter progress in mock storage", async () => {
    const enrollResult = await mockAdapter.enroll(1);
    expect(enrollResult.enrolled).toContain(1);

    const enrollments = await mockAdapter.getEnrollments();
    expect(enrollments).toContain(1);

    const compResult = await mockAdapter.completeChapter(1, 1);
    expect(compResult.completed).toContain(1);

    const progress = await mockAdapter.getProgress();
    expect(progress.completedChapters[1]).toContain(1);
  });
});
