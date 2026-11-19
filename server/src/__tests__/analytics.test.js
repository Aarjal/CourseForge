const request = require("supertest");
const app = require("../app");
const Course = require("../models/course");
const Enrollment = require("../models/enrollment");
const Progress = require("../models/progress");
const { createTestUser } = require("../tests/setup");

describe("Analytics API (/api/v1/analytics/overview)", () => {
  let instructorToken;
  let instructorUser;
  let studentToken;
  let studentUser;
  let course;

  beforeEach(async () => {
    const instructor = await createTestUser({
      name: "Instructor User",
      email: "analytics-inst@example.com",
      role: "instructor",
    });
    instructorToken = instructor.token;
    instructorUser = instructor.user;

    const student = await createTestUser({
      name: "Enrolled Student",
      email: "analytics-student@example.com",
      role: "student",
    });
    studentToken = student.token;
    studentUser = student.user;

    course = await Course.create({
      title: "Data Engineering with Python",
      description: "ETL pipelines and Kafka",
      category: "Data",
      level: "Intermediate",
      published: true,
      price: 39.99,
      createdBy: instructorUser._id,
    });

    await Enrollment.create({
      user: studentUser._id,
      course: course._id,
      status: "active",
    });

    await Progress.create({
      user: studentUser._id,
      course: course._id,
      completed: true,
      completedChapters: [],
    });
  });

  it("rejects unauthenticated request with 401", async () => {
    const res = await request(app).get("/api/v1/analytics/overview");
    expect(res.status).toBe(401);
  });

  it("rejects student role with 403 Forbidden", async () => {
    const res = await request(app)
      .get("/api/v1/analytics/overview")
      .set("Authorization", `Bearer ${studentToken}`);
    expect(res.status).toBe(403);
  });

  it("returns summary, course metrics, and recent enrollments for instructor", async () => {
    const res = await request(app)
      .get("/api/v1/analytics/overview")
      .set("Authorization", `Bearer ${instructorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.summary).toBeDefined();
    expect(res.body.summary.totalCourses).toBe(1);
    expect(res.body.summary.publishedCourses).toBe(1);
    expect(res.body.summary.totalStudents).toBe(1);
    expect(res.body.summary.totalEnrollments).toBe(1);
    expect(res.body.summary.totalCompletions).toBe(1);

    expect(res.body.courses).toHaveLength(1);
    expect(res.body.courses[0].title).toBe("Data Engineering with Python");
    expect(res.body.courses[0].enrollmentsCount).toBe(1);
    expect(res.body.courses[0].completionsCount).toBe(1);
    expect(res.body.courses[0].completionRate).toBe(100);

    expect(res.body.recentEnrollments).toHaveLength(1);
    expect(res.body.recentEnrollments[0].course.title).toBe("Data Engineering with Python");
    expect(res.body.recentEnrollments[0].user.email).toBe("analytics-student@example.com");
  });
});
