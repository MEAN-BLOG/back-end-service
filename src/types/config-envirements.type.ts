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

  /**
   * development server
   * @example domain.com
   */
  DevelopmentServer: string;

  /**
   * mode server runs
   * @example development
   */
  NODE_ENV?: string;

  /**
   * mode server runs
   * @example development
   */
  CLIENT_URL: string;
};

/**
 * token generation keys
 * Defines the configuration need for generation token and handle requests
 */
export type TTokenConfig = {
  JWT_ACCESS_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_ACCESS_EXPIRY: string;
  JWT_REFRESH_EXPIRY: string;
};
