module.exports = {
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.js"],
  testTimeout: 180000,
  globalSetup: "<rootDir>/src/tests/globalSetup.js",
  globalTeardown: "<rootDir>/src/tests/globalTeardown.js",
  setupFilesAfterEnv: ["<rootDir>/src/tests/setup.js"],
  verbose: true,
};
