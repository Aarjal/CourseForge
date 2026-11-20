const request = require("supertest");
const path = require("path");
const fs = require("fs");
const app = require("../app");
const Course = require("../models/course");
const Chapter = require("../models/chapter");
const { createTestUser } = require("../tests/setup");

describe("File Uploads & Media API (/api/v1/uploads)", () => {
  let instructorToken;
  let instructorUser;
  let studentToken;

  beforeEach(async () => {
    const instructor = await createTestUser({
      name: "Media Instructor",
      email: "media-inst@example.com",
      role: "instructor",
    });
    instructorToken = instructor.token;
    instructorUser = instructor.user;

    const student = await createTestUser({
      name: "Media Student",
      email: "media-student@example.com",
      role: "student",
    });
    studentToken = student.token;
  });

  it("rejects unauthenticated upload with 401", async () => {
    const res = await request(app)
      .post("/api/v1/uploads")
      .attach("file", Buffer.from("sample file content"), "sample.pdf");

    expect(res.status).toBe(401);
  });

  it("rejects student role from uploading with 403", async () => {
    const res = await request(app)
      .post("/api/v1/uploads")
      .set("Authorization", `Bearer ${studentToken}`)
      .attach("file", Buffer.from("sample student content"), "notes.pdf");

    expect(res.status).toBe(403);
  });

  it("uploads a file successfully for instructor and returns URL", async () => {
    const fileBuffer = Buffer.from("%PDF-1.4 sample pdf content for lecture notes");

    const res = await request(app)
      .post("/api/v1/uploads")
      .set("Authorization", `Bearer ${instructorToken}`)
      .field("folder", "documents")
      .attach("file", fileBuffer, "lecture-notes.pdf");

    expect(res.status).toBe(201);
    expect(res.body.file).toBeDefined();
    expect(res.body.file.url).toContain("/uploads/");
    expect(res.body.file.mimetype).toBe("application/pdf");

    // Clean up created file if on disk
    if (res.body.file.filename) {
      const filePath = path.join(__dirname, "../../uploads", res.body.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  });

  it("rejects unsupported MIME types", async () => {
    const executableBuffer = Buffer.from("MZ binary content");

    const res = await request(app)
      .post("/api/v1/uploads")
      .set("Authorization", `Bearer ${instructorToken}`)
      .attach("file", executableBuffer, "malware.exe");

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("Unsupported file type");
  });

  it("persists course with thumbnail and chapter with materials", async () => {
    const course = await Course.create({
      title: "Design Systems with Figma",
      description: "Tokens, components, and auto-layout",
      category: "Design",
      level: "Intermediate",
      published: true,
      thumbnail: "/uploads/sample-thumbnail.png",
      createdBy: instructorUser._id,
    });

    const chapter = await Chapter.create({
      course: course._id,
      title: "Color Tokens & Themes",
      duration: 25,
      order: 1,
      preview: true,
      videoUrl: "https://example.com/videos/lesson1.mp4",
      materials: [
        {
          title: "Lecture Slides PDF",
          url: "/uploads/design-tokens.pdf",
          type: "application/pdf",
          size: 102400,
        },
      ],
    });

    const fetchedChapter = await Chapter.findById(chapter._id);
    expect(fetchedChapter.videoUrl).toBe("https://example.com/videos/lesson1.mp4");
    expect(fetchedChapter.materials).toHaveLength(1);
    expect(fetchedChapter.materials[0].title).toBe("Lecture Slides PDF");

    const fetchedCourse = await Course.findById(course._id);
    expect(fetchedCourse.thumbnail).toBe("/uploads/sample-thumbnail.png");
  });
});
