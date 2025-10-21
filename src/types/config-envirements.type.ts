/**
 * Database configuration environment variables.
 * These are required for connecting to the MongoDB instance.
 */
export type TmongoDbConfig = {
  /**
   * MongoDB username used for authentication.
   * @example "dbUser"
   */
  mongoDbUserName: string | undefined;

  /**
   * MongoDB password used for authentication.
   * @example "securePassword123"
   */
  mongoDbPassword: string | undefined;

  /**
   * MongoDB database name to connect to.
   * @example "urrigation"
   */
  mongoDbDatabase: string | undefined;
};

/**
 * Server configuration environment variables.
 * Defines runtime settings for the Node.js server.
 */
export type TserverConfig = {
  /**
   * Port number on which the server should run.
   * @example 5000
   */
  PORT: number;
};
