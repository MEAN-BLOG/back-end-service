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
const uri = `mongodb+srv://${mongoDbUserName}:${mongoDbPassword}@cluster0.ywnsq.mongodb.net/${mongoDbDatabase}?retryWrites=true&w=majority`;

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
export async function connectToMongoDB(): Promise<void> {
  try {
    await mongoose.connect(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 30000,
    } as ConnectOptions);
    console.log('✅ Successfully connected to MongoDB with Mongoose');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}
