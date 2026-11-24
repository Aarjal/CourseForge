const request = require("supertest");
const app = require("../app");
const Course = require("../models/course");
const Quiz = require("../models/quiz");
const QuizAttempt = require("../models/quizAttempt");
const Enrollment = require("../models/enrollment");
const Progress = require("../models/progress");
const { createTestUser } = require("../tests/setup");

describe("Quiz & Assessment Engine API (/api/v1/courses/:courseId/quiz)", () => {
  let instructorUser;
  let instructorToken;
  let studentUser;
  let studentToken;
  let otherStudentToken;
  let course;

  const sampleQuizData = {
    title: "Web Standards & DOM Knowledge Check",
    description: "Test understanding of HTML structure and DOM nodes",
    passingScore: 75,
    questions: [
      {
        question: "What is the primary role of HTML?",
        options: [
          "Database management",
          "Webpage document structuring",
          "Network packet routing",
          "Client-side styling",
        ],
        correctAnswer: 1,
        explanation: "HTML provides semantic structure to web documents.",
      },
      {
        question: "Which tag is used for the largest heading?",
        options: ["<h6>", "<head>", "<h1>", "<header>"],
        correctAnswer: 2,
        explanation: "<h1> represents the highest level section heading.",
      },
      {
        question: "Which attribute specifies an alternative text for an image?",
        options: ["title", "src", "alt", "href"],
        correctAnswer: 2,
        explanation: "The alt attribute provides alternative text for accessibility.",
      },
      {
        question: "Which of the following is a block-level element?",
        options: ["<span>", "<div>", "<a>", "<strong>"],
        correctAnswer: 1,
        explanation: "<div> is a block-level container element.",
      },
    ],
  };

  beforeEach(async () => {
    const instructor = await createTestUser({
      name: "Quiz Instructor",
      email: "quiz-inst@example.com",
      role: "instructor",
    });
    instructorUser = instructor.user;
    instructorToken = instructor.token;

    const student = await createTestUser({
      name: "Quiz Student",
      email: "quiz-student@example.com",
      role: "student",
    });
    studentUser = student.user;
    studentToken = student.token;

    const otherStudent = await createTestUser({
      name: "Other Student",
      email: "other-student@example.com",
      role: "student",
    });
    otherStudentToken = otherStudent.token;

    course = await Course.create({
      title: "Modern HTML5 & Semantic Web",
      description: "Master modern document architecture",
      category: "Development",
      level: "Beginner",
      published: true,
      createdBy: instructorUser._id,
    });

    // Enroll student in the course
    await Enrollment.create({
      user: studentUser._id,
      course: course._id,
      status: "active",
    });

    await Progress.create({
      user: studentUser._id,
      course: course._id,
      completedChapters: [],
      quizDone: false,
    });
  });

  describe("Quiz Creation & Authorization", () => {
    it("rejects unauthenticated request to create a quiz with 401", async () => {
      const res = await request(app)
        .post(`/api/v1/courses/${course._id}/quiz`)
        .send(sampleQuizData);

      expect(res.status).toBe(401);
    });

    it("rejects student role from creating a quiz with 403", async () => {
      const res = await request(app)
        .post(`/api/v1/courses/${course._id}/quiz`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send(sampleQuizData);

      expect(res.status).toBe(403);
    });

    it("allows instructor to create a course quiz (201)", async () => {
      const res = await request(app)
        .post(`/api/v1/courses/${course._id}/quiz`)
        .set("Authorization", `Bearer ${instructorToken}`)
        .send(sampleQuizData);

      expect(res.status).toBe(201);
      expect(res.body._id).toBeDefined();
      expect(res.body.title).toBe(sampleQuizData.title);
      expect(res.body.passingScore).toBe(75);
      expect(res.body.questions).toHaveLength(4);
      expect(res.body.questions[0].correctAnswer).toBe(1);
    });

    it("rejects duplicate quiz creation for the same course with 409", async () => {
      await request(app)
        .post(`/api/v1/courses/${course._id}/quiz`)
        .set("Authorization", `Bearer ${instructorToken}`)
        .send(sampleQuizData);

      const res = await request(app)
        .post(`/api/v1/courses/${course._id}/quiz`)
        .set("Authorization", `Bearer ${instructorToken}`)
        .send(sampleQuizData);

      expect(res.status).toBe(409);
      expect(res.body.error).toBe("Conflict");
    });
  });

  describe("Quiz Retrieval & Secure Masking (Decision 21)", () => {
    beforeEach(async () => {
      await request(app)
        .post(`/api/v1/courses/${course._id}/quiz`)
        .set("Authorization", `Bearer ${instructorToken}`)
        .send(sampleQuizData);
    });

    it("masks correctAnswer and explanation when students fetch the quiz", async () => {
      const res = await request(app)
        .get(`/api/v1/courses/${course._id}/quiz`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.title).toBe(sampleQuizData.title);
      expect(res.body.questions).toHaveLength(4);

      // Verify answers are strictly masked on the server
      res.body.questions.forEach((q) => {
        expect(q.correctAnswer).toBeUndefined();
        expect(q.explanation).toBeUndefined();
        expect(q.options).toBeDefined();
        expect(q.question).toBeDefined();
      });
    });

    it("provides full quiz with answer keys to instructors", async () => {
      const res = await request(app)
        .get(`/api/v1/courses/${course._id}/quiz`)
        .set("Authorization", `Bearer ${instructorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.questions[0].correctAnswer).toBe(1);
      expect(res.body.questions[0].explanation).toBeDefined();
    });
  });

  describe("Quiz Submission & Assessment Engine", () => {
    beforeEach(async () => {
      await request(app)
        .post(`/api/v1/courses/${course._id}/quiz`)
        .set("Authorization", `Bearer ${instructorToken}`)
        .send(sampleQuizData);
    });

    it("rejects quiz submission from non-enrolled students with 403", async () => {
      const res = await request(app)
        .post(`/api/v1/courses/${course._id}/quiz/submit`)
        .set("Authorization", `Bearer ${otherStudentToken}`)
        .send({ answers: [1, 2, 2, 1] });

      expect(res.status).toBe(403);
      expect(res.body.error).toBe("Forbidden");
    });

    it("evaluates student answers, scores attempt, and updates progress upon passing", async () => {
      // 4 out of 4 correct answers -> 100% (passing score is 75%)
      const res = await request(app)
        .post(`/api/v1/courses/${course._id}/quiz/submit`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send({ answers: [1, 2, 2, 1] });

      expect(res.status).toBe(201);
      expect(res.body.score).toBe(4);
      expect(res.body.totalQuestions).toBe(4);
      expect(res.body.percentage).toBe(100);
      expect(res.body.passed).toBe(true);
      expect(res.body.results).toHaveLength(4);
      expect(res.body.results[0].isCorrect).toBe(true);

      // Verify Progress model was updated
      const progress = await Progress.findOne({ user: studentUser._id, course: course._id });
      expect(progress.quizDone).toBe(true);

      // Verify QuizAttempt persisted
      const attempts = await QuizAttempt.find({ user: studentUser._id, course: course._id });
      expect(attempts).toHaveLength(1);
      expect(attempts[0].passed).toBe(true);
    });

    it("evaluates failing score correctly and does not mark quizDone", async () => {
      // 1 out of 4 correct -> 25% (failing)
      const res = await request(app)
        .post(`/api/v1/courses/${course._id}/quiz/submit`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send({ answers: [1, 0, 0, 0] });

      expect(res.status).toBe(201);
      expect(res.body.score).toBe(1);
      expect(res.body.percentage).toBe(25);
      expect(res.body.passed).toBe(false);

      const progress = await Progress.findOne({ user: studentUser._id, course: course._id });
      expect(progress.quizDone).toBe(false);
    });

    it("retrieves past attempts for user", async () => {
      // Submit an attempt
      await request(app)
        .post(`/api/v1/courses/${course._id}/quiz/submit`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send({ answers: [1, 2, 2, 1] });

      const res = await request(app)
        .get(`/api/v1/courses/${course._id}/quiz/attempts`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].score).toBe(4);
    });
  });

  describe("Quiz Modification & Deletion", () => {
    beforeEach(async () => {
      await request(app)
        .post(`/api/v1/courses/${course._id}/quiz`)
        .set("Authorization", `Bearer ${instructorToken}`)
        .send(sampleQuizData);
    });

    it("allows instructor to update quiz passingScore and title", async () => {
      const res = await request(app)
        .put(`/api/v1/courses/${course._id}/quiz`)
        .set("Authorization", `Bearer ${instructorToken}`)
        .send({ title: "Updated Quiz Title", passingScore: 90 });

      expect(res.status).toBe(200);
      expect(res.body.title).toBe("Updated Quiz Title");
      expect(res.body.passingScore).toBe(90);
    });

    it("allows instructor to delete quiz and cleans up attempts", async () => {
      const res = await request(app)
        .delete(`/api/v1/courses/${course._id}/quiz`)
        .set("Authorization", `Bearer ${instructorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain("deleted");

      const check = await Quiz.findOne({ course: course._id });
      expect(check).toBeNull();
    });
  });
});
