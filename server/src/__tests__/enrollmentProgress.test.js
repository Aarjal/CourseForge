const request = require("supertest");
const app = require("../app");
const Course = require("../models/course");
const Chapter = require("../models/chapter");
const Enrollment = require("../models/enrollment");
const Progress = require("../models/progress");
const { createTestUser } = require("../tests/setup");

describe("Enrollment & Progress API", () => {
  let studentUser;
  let studentToken;
  let otherStudentToken;
  let instructorUser;
  let instructorToken;
  let testCourse;
  let previewChapter;
  let lockedChapter;

  beforeEach(async () => {
    const student = await createTestUser({
      name: "Student One",
      email: "student1@example.com",
      role: "student",
    });
    studentUser = student.user;
    studentToken = student.token;

    const otherStudent = await createTestUser({
      name: "Student Two",
      email: "student2@example.com",
      role: "student",
    });
    otherStudentToken = otherStudent.token;

    const instructor = await createTestUser({
      name: "Prof Smith",
      email: "prof@example.com",
      role: "instructor",
    });
    instructorUser = instructor.user;
    instructorToken = instructor.token;

    testCourse = await Course.create({
      title: "Fullstack Mastery",
      description: "Complete fullstack course",
      category: "Development",
      level: "Intermediate",
      published: true,
      createdBy: instructorUser._id,
    });

    previewChapter = await Chapter.create({
      course: testCourse._id,
      title: "Free Preview: Welcome",
      duration: 10,
      order: 1,
      preview: true,
      content: "This is free preview content.",
    });

    lockedChapter = await Chapter.create({
      course: testCourse._id,
      title: "Locked: Deep Dive",
      duration: 30,
      order: 2,
      preview: false,
      content: "Top secret locked lecture material.",
    });
  });

  describe("Enrollment Endpoints (/api/v1/enrollments)", () => {
    it("enrolls a student in a course", async () => {
      const res = await request(app)
        .post(`/api/v1/enrollments/${testCourse._id}`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(res.status).toBe(201);
      expect(res.body.enrollment).toBeDefined();
      expect(res.body.enrollment.status).toBe("active");

      // Verify DB record
      const dbEnrollment = await Enrollment.findOne({
        user: studentUser._id,
        course: testCourse._id,
      });
      expect(dbEnrollment).toBeTruthy();

      // Verify progress record initialized
      const dbProgress = await Progress.findOne({
        user: studentUser._id,
        course: testCourse._id,
      });
      expect(dbProgress).toBeTruthy();
      expect(dbProgress.completedChapters).toEqual([]);
    });

    it("handles duplicate enrollment idempotently with 200", async () => {
      await request(app)
        .post(`/api/v1/enrollments/${testCourse._id}`)
        .set("Authorization", `Bearer ${studentToken}`);

      const res2 = await request(app)
        .post(`/api/v1/enrollments/${testCourse._id}`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(res2.status).toBe(200);
      expect(res2.body.message).toContain("Already enrolled");
    });

    it("rejects unauthenticated enrollment with 401", async () => {
      const res = await request(app).post(`/api/v1/enrollments/${testCourse._id}`);
      expect(res.status).toBe(401);
    });

    it("returns 404 for non-existent course", async () => {
      const res = await request(app)
        .post("/api/v1/enrollments/507f1f77bcf86cd799439011")
        .set("Authorization", `Bearer ${studentToken}`);
      expect(res.status).toBe(404);
    });

    it("lists enrolled courses for the logged-in user", async () => {
      await request(app)
        .post(`/api/v1/enrollments/${testCourse._id}`)
        .set("Authorization", `Bearer ${studentToken}`);

      const res = await request(app)
        .get("/api/v1/enrollments")
        .set("Authorization", `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.count).toBe(1);
      expect(res.body.enrolledCourseIds).toContainEqual(testCourse._id.toString());
    });
  });

  describe("Progress Endpoints (/api/v1/progress)", () => {
    beforeEach(async () => {
      // Enroll student1
      await request(app)
        .post(`/api/v1/enrollments/${testCourse._id}`)
        .set("Authorization", `Bearer ${studentToken}`);
    });

    it("marks a chapter as completed and computes progress percentage", async () => {
      const res = await request(app)
        .post(`/api/v1/progress/${testCourse._id}/chapters/${previewChapter._id}`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.percentage).toBe(50); // 1 out of 2 chapters
      expect(res.body.courseCompleted).toBe(false);

      // Complete second chapter
      const res2 = await request(app)
        .post(`/api/v1/progress/${testCourse._id}/chapters/${lockedChapter._id}`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(res2.status).toBe(200);
      expect(res2.body.percentage).toBe(100);
      expect(res2.body.courseCompleted).toBe(true);
    });

    it("rejects progress update if user is not enrolled in course (403)", async () => {
      // student2 is not enrolled
      const res = await request(app)
        .post(`/api/v1/progress/${testCourse._id}/chapters/${previewChapter._id}`)
        .set("Authorization", `Bearer ${otherStudentToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error).toBe("Forbidden");
    });

    it("retrieves progress for a specific course", async () => {
      await request(app)
        .post(`/api/v1/progress/${testCourse._id}/chapters/${previewChapter._id}`)
        .set("Authorization", `Bearer ${studentToken}`);

      const res = await request(app)
        .get(`/api/v1/progress/${testCourse._id}`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.totalChapters).toBe(2);
      expect(res.body.percentage).toBe(50);
      expect(res.body.completedChapters).toHaveLength(1);
    });
  });

  describe("Server-Enforced Locked Content Rules (Decision 8)", () => {
    it("allows anyone to view preview chapters without auth", async () => {
      const res = await request(app).get(`/api/v1/chapters/${previewChapter._id}`);
      expect(res.status).toBe(200);
      expect(res.body.title).toBe("Free Preview: Welcome");
      expect(res.body.content).toBe("This is free preview content.");
    });

    it("blocks unauthenticated requests to locked chapters with 401", async () => {
      const res = await request(app).get(`/api/v1/chapters/${lockedChapter._id}`);
      expect(res.status).toBe(401);
      expect(res.body.error).toBe("Unauthorized");
    });

    it("blocks authenticated students not enrolled with 403 Forbidden", async () => {
      const res = await request(app)
        .get(`/api/v1/chapters/${lockedChapter._id}`)
        .set("Authorization", `Bearer ${otherStudentToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error).toBe("Forbidden");
      expect(res.body.message).toContain("locked");
    });

    it("allows enrolled students to view locked chapter content", async () => {
      // Enroll student1
      await request(app)
        .post(`/api/v1/enrollments/${testCourse._id}`)
        .set("Authorization", `Bearer ${studentToken}`);

      const res = await request(app)
        .get(`/api/v1/chapters/${lockedChapter._id}`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.content).toBe("Top secret locked lecture material.");
    });

    it("allows instructors to view locked chapters without enrollment", async () => {
      const res = await request(app)
        .get(`/api/v1/chapters/${lockedChapter._id}`)
        .set("Authorization", `Bearer ${instructorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.content).toBe("Top secret locked lecture material.");
    });
  });
});
