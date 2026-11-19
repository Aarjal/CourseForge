const request = require("supertest");
const app = require("../app");
const Course = require("../models/course");
const Chapter = require("../models/chapter");
const { createTestUser } = require("../tests/setup");

describe("Chapter API Endpoints (/api/v1/courses/:id/chapters and /api/v1/chapters)", () => {
  let course;
  let instructorToken;

  beforeEach(async () => {
    const { user, token } = await createTestUser({ role: "instructor" });
    instructorToken = token;

    course = await Course.create({
      title: "Microservices with Node",
      description: "Distributed architectures with Node.js",
      category: "Backend",
      level: "Advanced",
      published: true,
      createdBy: user._id,
    });
  });

  it("auto-assigns chapter order incrementally", async () => {
    const res1 = await request(app)
      .post(`/api/v1/courses/${course._id}/chapters`)
      .set("Authorization", `Bearer ${instructorToken}`)
      .send({
        title: "Introduction to Event-Driven Systems",
        duration: 15,
        preview: true,
      });

    expect(res1.status).toBe(201);
    expect(res1.body.order).toBe(1);

    const res2 = await request(app)
      .post(`/api/v1/courses/${course._id}/chapters`)
      .set("Authorization", `Bearer ${instructorToken}`)
      .send({
        title: "Message Brokers & RabbitMQ",
        duration: 30,
        preview: false,
      });

    expect(res2.status).toBe(201);
    expect(res2.body.order).toBe(2);
  });

  it("fetches chapters for a course in sorted order (public)", async () => {
    await Chapter.create([
      { course: course._id, title: "Second Lesson", duration: 20, order: 2 },
      { course: course._id, title: "First Lesson", duration: 15, order: 1 },
    ]);

    const res = await request(app).get(`/api/v1/courses/${course._id}/chapters`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);
    expect(res.body[0].title).toBe("First Lesson");
    expect(res.body[1].title).toBe("Second Lesson");
  });

  it("reorders chapters via PATCH /reorder (authenticated)", async () => {
    const ch1 = await Chapter.create({
      course: course._id,
      title: "Lesson A",
      duration: 10,
      order: 1,
    });
    const ch2 = await Chapter.create({
      course: course._id,
      title: "Lesson B",
      duration: 20,
      order: 2,
    });

    const res = await request(app)
      .patch(`/api/v1/courses/${course._id}/chapters/reorder`)
      .set("Authorization", `Bearer ${instructorToken}`)
      .send({
        chapterOrders: [
          { id: ch1._id.toString(), order: 2 },
          { id: ch2._id.toString(), order: 1 },
        ],
      });

    expect(res.status).toBe(200);
    expect(res.body[0].title).toBe("Lesson B");
    expect(res.body[0].order).toBe(1);
    expect(res.body[1].title).toBe("Lesson A");
    expect(res.body[1].order).toBe(2);
  });

  it("cascade deletes chapters when the parent course is deleted (authenticated)", async () => {
    await Chapter.create({
      course: course._id,
      title: "Doomed Chapter",
      duration: 10,
      order: 1,
    });

    const delRes = await request(app)
      .delete(`/api/v1/courses/${course._id}`)
      .set("Authorization", `Bearer ${instructorToken}`);
    expect(delRes.status).toBe(200);

    const remainingChapters = await Chapter.find({ course: course._id });
    expect(remainingChapters.length).toBe(0);
  });
});
