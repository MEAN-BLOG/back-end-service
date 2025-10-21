/**
 * @module server
 * @description Main server entry point.
 * This module initializes the Express application and establishes a connection to MongoDB.
 */

import app from './app';

/**
 * Starts the Express server and establishes a connection to MongoDB.
 * @async
 * @function startServer
 * @param {number} [port] - Optional port number to use (defaults to environment variable)
 * @throws {Error} If the server fails to start or connect to the database
 */

async function startServer(port?: number) {
  try {
    const serverPort = port || process.env.PORT || 5000;

    app.listen(serverPort, () => {
      console.log(`🚀 Server is running on port ${serverPort}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}
