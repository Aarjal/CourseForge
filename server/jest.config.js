module.exports = {
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.js"],
  testTimeout: 180000,
  setupFilesAfterEnv: ["<rootDir>/src/tests/setup.js"],
  verbose: true,
};
