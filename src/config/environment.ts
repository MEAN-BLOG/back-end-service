/**
 * @module config/envirementVariables
 * @description Environment variables configuration and type definitions.
 * This module handles loading and typing environment variables for the application.
 */

import { TmongoDbConfig, TserverConfig, TTokenConfig } from '../types/config-envirements.type';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * Environment variables loaded from process.env
 * @constant
 * @type {Object}
 * @property {string} PORT - The port number the server will listen on
 * @property {string} mongoDbUserName - MongoDB username for authentication
 * @property {string} mongoDbPassword - MongoDB password for authentication
 * @property {string} mongoDbDatabase - Name of the MongoDB database
emails
 */
const {
  PORT,
  mongoDbUserName,
  mongoDbPassword,
  mongoDbDatabase,
  DevelopmentServer,
  JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRY,
  JWT_REFRESH_EXPIRY,
  NODE_ENV,
  CLIENT_URL,
} = process.env;

// Validate required environment variables
const requiredEnvVars = {
  PORT,
  mongoDbUserName,
  mongoDbPassword,
  mongoDbDatabase,
  DevelopmentServer,
  JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRY,
  JWT_REFRESH_EXPIRY,
  NODE_ENV,
  CLIENT_URL,
};

const missingVars = Object.entries(requiredEnvVars)
  .filter(([, value]) => value === undefined)
  .map(([key]) => key);

if (missingVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

/**
 * Server configuration object
 * @type {TserverConfig}
 */
const serverConfig: TserverConfig = {
  PORT: parseInt(PORT as string, 10) || 5001,
  DevelopmentServer: DevelopmentServer!,
  CLIENT_URL: CLIENT_URL!,
};

/**
 * MongoDB connection configuration
 * @type {TmongoDbConfig}
 */
const mongoDbConfig: TmongoDbConfig = {
  mongoDbUserName: mongoDbUserName as string,
  mongoDbPassword: mongoDbPassword as string,
  mongoDbDatabase: mongoDbDatabase as string,
};

/**
 * JWT connection token and configuration
 * @type {TTokenConfig}
 */
const tokenConfig: TTokenConfig = {
  JWT_ACCESS_SECRET: JWT_ACCESS_SECRET!,
  JWT_REFRESH_SECRET: JWT_REFRESH_SECRET!,
  JWT_ACCESS_EXPIRY: JWT_ACCESS_EXPIRY!,
  JWT_REFRESH_EXPIRY: JWT_REFRESH_EXPIRY!,
};
/**
 * Consolidated environment variables object
 * @constant
 * @type {Object}
 * @property {TserverConfig} serverConfig - Server configuration
 * @property {TmongoDbConfig} mongoDbConfig - MongoDB configuration
 */
export const enirementVariables = {
  serverConfig,
  mongoDbConfig,
  tokenConfig,
} as const;
