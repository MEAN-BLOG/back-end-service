/**
 * @module config/connectDb
 * @description MongoDB connection configuration and utilities.
 * This module handles the connection to MongoDB Atlas and provides a reusable client.
 */

import { enirementVariables } from './environment';
import mongoose, { ConnectOptions } from 'mongoose';

/**
 * MongoDB connection URL constructed from environment variables
 * @constant
 * @type {string}
 */
const { mongoDbDatabase, mongoDbPassword, mongoDbUserName } = enirementVariables.mongoDbConfig;
const uri = `mongodb+srv://${mongoDbUserName}:${mongoDbPassword}@blog.xagb6ff.mongodb.net/?retryWrites=true&w=majority`;

/**
 * Establishes a connection to the MongoDB Atlas database
 * @async
 * @function connectToMongoDB
 * @returns {Promise<{success: boolean; message: string; db?: Db; client?: MongoClient}>} Connection result with status and optional database client
 *
 * @example
 * const { success, message, db, client } = await connectToMongoDB();
 * if (success) {
 *   // Use db for database operations
 *   const result = await db.collection('users').find({}).toArray();
 *   // Don't forget to close the connection when done
 *   await client.close();
 * }
 */
export async function connectToMongoDB(retries = 5, delay = 5000): Promise<void> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await mongoose.connect(uri, {
        appName: "devrel.vercel.integration",
        maxIdleTimeMS: 5000,
        serverSelectionTimeoutMS: 20000, // wait up to 20s before failing
      } as ConnectOptions);

      console.log('✅ Successfully connected to MongoDB with Mongoose');
      return;
    } catch (error) {
      console.error(`❌ MongoDB connection failed (attempt ${attempt}/${retries}):`, error);

      if (attempt < retries) {
        console.log(`⏳ Retrying in ${delay / 1000} seconds...`);
        await new Promise(res => setTimeout(res, delay));
        delay *= 2; // exponential backoff (5s → 10s → 20s → ...)
      } else {
        console.error('❌ All retry attempts failed. Exiting...');
        process.exit(1);
      }
    }
  }
}