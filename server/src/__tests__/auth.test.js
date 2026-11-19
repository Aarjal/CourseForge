const request = require("supertest");
const app = require("../app");
const User = require("../models/user");
const { createTestUser } = require("../tests/setup");

describe("Auth API Endpoints (/api/v1/auth)", () => {
  describe("POST /register", () => {
    it("registers a new user and returns tokens", async () => {
      const res = await request(app).post("/api/v1/auth/register").send({
        name: "Jane Doe",
        email: "jane@example.com",
        password: "securepass123",
      });

      expect(res.status).toBe(201);
      expect(res.body.user.name).toBe("Jane Doe");
      expect(res.body.user.email).toBe("jane@example.com");
      expect(res.body.user.role).toBe("student"); // Default role
      expect(res.body.accessToken).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
      // Password should NOT be in the response
      expect(res.body.user.password).toBeUndefined();
    });

    it("rejects duplicate email with 409", async () => {
      await User.create({
        name: "First",
        email: "dupe@example.com",
        password: "password123",
      });

      const res = await request(app).post("/api/v1/auth/register").send({
        name: "Second",
        email: "dupe@example.com",
        password: "password456",
      });

      expect(res.status).toBe(409);
      expect(res.body.error).toBe("Conflict");
    });

    it("rejects registration with missing fields (Zod validation)", async () => {
      const res = await request(app).post("/api/v1/auth/register").send({
        name: "No Email",
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Validation Error");
    });
  });

  describe("POST /login", () => {
    beforeEach(async () => {
      await User.create({
        name: "Login User",
        email: "login@example.com",
        password: "mypassword",
      });
    });

    it("logs in with correct credentials and returns tokens", async () => {
      const res = await request(app).post("/api/v1/auth/login").send({
        email: "login@example.com",
        password: "mypassword",
      });

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe("login@example.com");
      expect(res.body.accessToken).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
    });

    it("rejects wrong password with 401", async () => {
      const res = await request(app).post("/api/v1/auth/login").send({
        email: "login@example.com",
        password: "wrongpassword",
      });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe("Unauthorized");
    });

    it("rejects non-existent email with 401", async () => {
      const res = await request(app).post("/api/v1/auth/login").send({
        email: "nobody@example.com",
        password: "whatever",
      });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe("Unauthorized");
    });
  });

  describe("GET /me", () => {
    it("returns current user when authenticated", async () => {
      const { token } = await createTestUser({
        email: "me@example.com",
        role: "student",
      });

      const res = await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe("me@example.com");
      expect(res.body.user.role).toBe("student");
    });

    it("rejects unauthenticated request with 401", async () => {
      const res = await request(app).get("/api/v1/auth/me");

      expect(res.status).toBe(401);
      expect(res.body.error).toBe("Unauthorized");
    });
  });

  describe("POST /refresh", () => {
    it("issues a new access token with valid refresh token", async () => {
      // Register to get a refresh token
      const registerRes = await request(app)
        .post("/api/v1/auth/register")
        .send({
          name: "Refresh User",
          email: "refresh@example.com",
          password: "password123",
        });

      const { refreshToken } = registerRes.body;

      const res = await request(app)
        .post("/api/v1/auth/refresh")
        .send({ refreshToken });

      expect(res.status).toBe(200);
      expect(res.body.accessToken).toBeDefined();
    });

    it("rejects request with no refresh token", async () => {
      const res = await request(app).post("/api/v1/auth/refresh").send({});

      expect(res.status).toBe(401);
    });
  });

  describe("POST /logout", () => {
    it("clears the refresh token cookie", async () => {
      const res = await request(app).post("/api/v1/auth/logout");

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Logged out successfully");
    });
  });
});
