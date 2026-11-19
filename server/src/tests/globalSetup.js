const { MongoMemoryServer } = require("mongodb-memory-server");

module.exports = async function globalSetup() {
  const instance = await MongoMemoryServer.create();
  const uri = instance.getUri();
  global.__MONGO_INSTANCE = instance;
  process.env.TEST_MONGO_URI = uri;
};
