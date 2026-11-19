const request = require("supertest");
const app = require("../app");
const Course = require("../models/course");
const Chapter = require("../models/chapter");
const { createTestUser } = require("../tests/setup");

describe("Course API Endpoints (/api/v1/courses)", () => {
  let instructorToken;
  let instructorUser;

  beforeEach(async () => {
    const { user, token } = await createTestUser({ role: "instructor" });
    instructorToken = token;
    instructorUser = user;
  });

  it("creates a course with valid input (authenticated instructor)", async () => {
    const res = await request(app)
      .post("/api/v1/courses")
      .set("Authorization", `Bearer ${instructorToken}`)
      .send({
        title: "Node.js Architecture",
        description: "Master enterprise backends with Node and Express",
        category: "Backend",
        level: "Intermediate",
        published: true,
        price: 29.99,
      });

    expect(res.status).toBe(201);
    expect(res.body._id).toBeDefined();
    expect(res.body.title).toBe("Node.js Architecture");
    expect(res.body.price).toBe(29.99);
    expect(res.body.createdBy).toBe(instructorUser._id.toString());
  });

  it("rejects unauthenticated course creation with 401", async () => {
    const res = await request(app)
      .post("/api/v1/courses")
      .send({
        title: "Should Fail",
        description: "No token provided",
        category: "Testing",
        level: "Beginner",
      });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Unauthorized");
  });

  it("rejects student role from creating courses with 403", async () => {
    const { token: studentToken } = await createTestUser({
      role: "student",
      email: "student@test.com",
    });

    const res = await request(app)
      .post("/api/v1/courses")
      .set("Authorization", `Bearer ${studentToken}`)
      .send({
        title: "Student Course",
        description: "Students cannot create courses",
        category: "Testing",
        level: "Beginner",
      });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe("Forbidden");
  });

  it("fails to create course with invalid level (Zod validation)", async () => {
    const res = await request(app)
      .post("/api/v1/courses")
      .set("Authorization", `Bearer ${instructorToken}`)
      .send({
        title: "Invalid Course",
        description: "Testing invalid enum",
        category: "Testing",
        level: "SuperExpert",
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Validation Error");
  });

  it("returns 400 Bad Request on invalid ObjectId format (CastError)", async () => {
    const res = await request(app).get("/api/v1/courses/invalid-mongo-id-123");

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Bad Request");
    expect(res.body.message).toContain("Invalid _id");
  });

  it("filters courses by search keyword and category with pagination", async () => {
    await Course.create([
      {
        title: "React Fundamentals",
        description: "Learn modern components and hooks",
        category: "Frontend",
        level: "Beginner",
        published: true,
        createdBy: instructorUser._id,
      },
      {
        title: "Advanced React Patterns",
        description: "Custom hooks and performance tuning",
        category: "Frontend",
        level: "Advanced",
        published: true,
        createdBy: instructorUser._id,
      },
      {
        title: "Python Data Science",
        description: "Pandas and NumPy for analysis",
        category: "Data",
        level: "Beginner",
        published: true,
        createdBy: instructorUser._id,
      },
    ]);

    // Search query
    const searchRes = await request(app).get("/api/v1/courses?search=React");
    expect(searchRes.status).toBe(200);
    expect(searchRes.body.total).toBe(2);
    expect(searchRes.body.courses.length).toBe(2);

    // Pagination query
    const pageRes = await request(app).get("/api/v1/courses?limit=1&page=1");
    expect(pageRes.status).toBe(200);
    expect(pageRes.body.courses.length).toBe(1);
    expect(pageRes.body.totalPages).toBe(3);
    expect(pageRes.body.total).toBe(3);
  });

  it("populates chapters in course details", async () => {
    const course = await Course.create({
      title: "Fullstack E-Commerce",
      description: "Build an end to end e-commerce app",
      category: "Fullstack",
      level: "Intermediate",
      published: true,
      createdBy: instructorUser._id,
    });

    await Chapter.create([
      {
        course: course._id,
        title: "Database Design",
        duration: 20,
        order: 1,
        preview: true,
      },
      {
        course: course._id,
        title: "Stripe Checkout",
        duration: 35,
        order: 2,
        preview: false,
      },
    ]);

    const res = await request(app).get(`/api/v1/courses/${course._id}`);
    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Fullstack E-Commerce");
    expect(res.body.chapters).toBeDefined();
    expect(res.body.chapters.length).toBe(2);
    expect(res.body.chapters[0].title).toBe("Database Design");
  });

  it("toggles course publish status (authenticated)", async () => {
    const course = await Course.create({
      title: "Draft Course",
      description: "Under active development",
      category: "General",
      level: "Beginner",
      published: false,
      createdBy: instructorUser._id,
    });

    const res = await request(app)
      .patch(`/api/v1/courses/${course._id}/publish`)
      .set("Authorization", `Bearer ${instructorToken}`);
    expect(res.status).toBe(200);
    expect(res.body.published).toBe(true);
  });
});
