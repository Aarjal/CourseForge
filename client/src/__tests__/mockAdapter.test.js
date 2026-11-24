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

  it("handles mock file upload and attaches media to course and chapters", async () => {
    const file = new File(["dummy pdf content"], "study-notes.pdf", { type: "application/pdf" });
    const uploaded = await mockAdapter.uploadFile(file);

    expect(uploaded.filename).toContain("study-notes.pdf");
    expect(uploaded.url).toBeDefined();

    const course = await mockAdapter.createCourse({
      title: "Audio Engineering",
      description: "Sound design and acoustics",
      category: "Audio",
      level: "Intermediate",
      thumbnail: "/uploads/audio-thumb.jpg",
    });

    expect(course.thumbnail).toBe("/uploads/audio-thumb.jpg");

    const chapter = await mockAdapter.addChapter(course.id, {
      title: "Signal Flow & Gain Staging",
      duration: 25,
      preview: true,
      videoUrl: "/uploads/lesson1.mp4",
      materials: [
        {
          title: "Gain Staging Cheat Sheet",
          url: uploaded.url,
          type: "application/pdf",
          size: 1024,
        },
      ],
    });

    expect(chapter.videoUrl).toBe("/uploads/lesson1.mp4");
    expect(chapter.materials).toHaveLength(1);
    expect(chapter.materials[0].title).toBe("Gain Staging Cheat Sheet");
  });

  it("handles mock quiz creation, retrieval, and scored submission", async () => {
    // 1. Get default quiz for course 1
    const quiz1 = await mockAdapter.getQuizByCourse("1");
    expect(quiz1).toBeDefined();
    expect(quiz1.questions.length).toBeGreaterThan(0);

    // 2. Create custom quiz for course 99
    const created = await mockAdapter.createQuiz("99", {
      title: "Algorithms Quiz",
      description: "Big-O and structures",
      passingScore: 75,
      questions: [
        {
          question: "What is binary search complexity?",
          options: ["O(n)", "O(log n)", "O(1)"],
          correctAnswer: 1,
          explanation: "Halves search space each step.",
        },
      ],
    });
    expect(created.title).toBe("Algorithms Quiz");

    // 3. Retrieve created quiz
    const fetched = await mockAdapter.getQuizByCourse("99");
    expect(fetched.title).toBe("Algorithms Quiz");

    // 4. Submit correct answer
    const submitResult = await mockAdapter.submitQuiz("99", { 0: 1 });
    expect(submitResult.passed).toBe(true);
    expect(submitResult.score).toBe(1);
    expect(submitResult.percentage).toBe(100);

    // 5. Verify attempts recorded
    const attempts = await mockAdapter.getQuizAttempts("99");
    expect(attempts.length).toBeGreaterThanOrEqual(1);
    expect(attempts[0].passed).toBe(true);
  });
});
