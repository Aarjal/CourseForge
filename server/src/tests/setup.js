const mongoose = require("mongoose");

beforeAll(async () => {
  const uri = process.env.TEST_MONGO_URI;
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri, {
      driverInfo: { name: "nodejs", version: process.version },
    });
  }
}, 180000);

afterEach(async () => {
  if (mongoose.connection.readyState === 1) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  }
});

/**
 * Helper: create a user and return user doc + access token.
 * Useful for tests that need authenticated requests.
 */
async function createTestUser(overrides = {}) {
  const User = require("../models/user");
  const { generateAccessToken } = require("../utils/jwt");

  const userData = {
    name: overrides.name || "Test User",
    email: overrides.email || `test-${Date.now()}-${Math.random()}@example.com`,
    password: overrides.password || "password123",
    role: overrides.role || "instructor",
    ...overrides,
  };

  const user = await User.create(userData);
  const token = generateAccessToken(user);
  return { user, token };
}

module.exports = { createTestUser };
