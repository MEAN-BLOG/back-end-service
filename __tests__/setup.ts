/**
 * @file __tests__/setup.ts
 * @module tests/setup
 * @description
 * Global Jest setup file that configures an in-memory MongoDB instance using
 * `mongodb-memory-server` for isolated, fast, and reproducible unit tests.
 *
 * This file ensures:
 * - A new MongoDB instance is created before all tests.
 * - The in-memory database is connected and cleared between tests.
 * - The server and connection are properly shut down after tests.
 *
 * @example
 * // Example usage (in jest.config.ts)
 * setupFilesAfterEnv: ['<rootDir>/__tests__/setup.ts']
 */

import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

/**
 * @constant
 * @description
 * Stores the MongoMemoryServer instance used to emulate MongoDB during tests.
 */
let mongoServer: MongoMemoryServer;

/**
 * @async
 * @function beforeAll
 * @description
 * Global Jest lifecycle hook that runs **once before all test suites**.
 * Initializes the in-memory MongoDB server and connects Mongoose to it.
 * Ensures a clean environment by disconnecting existing connections if any.
 *
 * @returns {Promise<void>} Resolves once the in-memory database is ready.
 */
beforeAll(async (): Promise<void> => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  await mongoose.connect(mongoUri);
});

/**
 * @async
 * @function afterAll
 * @description
 * Global Jest lifecycle hook that runs **once after all test suites**.
 * Closes the Mongoose connection and stops the MongoMemoryServer.
 *
 * @returns {Promise<void>} Resolves once cleanup is complete.
 */
afterAll(async (): Promise<void> => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  if (mongoServer) {
    await mongoServer.stop();
  }
});

/**
 * @async
 * @function beforeEach
 * @description
 * Global Jest lifecycle hook that runs **before each individual test**.
 * Clears all collections to ensure a consistent test environment.
 *
 * @returns {Promise<void>} Resolves once all collections are cleared.
 */
beforeEach(async (): Promise<void> => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

/**
 * @description
 * Sets a global timeout for Jest tests to prevent hangs due to async operations
 * (such as database setup or teardown) taking too long.
 */
jest.setTimeout(30000);
