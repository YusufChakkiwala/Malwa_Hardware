process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

const { MongoMemoryServer } = require('mongodb-memory-server-core');
const { connectDB, disconnectDB } = require('../src/config/db');

let mongoServer;
global.__RUN_DB_TESTS__ = process.env.RUN_DB_TESTS === 'true';

jest.setTimeout(90000);

beforeAll(async () => {
  if (!global.__RUN_DB_TESTS__) {
    return;
  }

  const useExternalDb = process.env.USE_EXTERNAL_TEST_DB === 'true';

  if (useExternalDb) {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is required when USE_EXTERNAL_TEST_DB=true');
    }
    await connectDB();
    return;
  }

  mongoServer = await MongoMemoryServer.create({
    instance: { dbName: 'malwa_hardware_test' }
  });
  process.env.MONGO_URI = mongoServer.getUri();
  await connectDB();
});

afterAll(async () => {
  if (!global.__RUN_DB_TESTS__) {
    return;
  }

  await disconnectDB();

  if (mongoServer) {
    await mongoServer.stop();
  }
});
