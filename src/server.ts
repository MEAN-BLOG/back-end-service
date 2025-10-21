/**
 * @module server
 * @description Main server entry point.
 * This module initializes the Express application and establishes a connection to MongoDB.
 */

import app from './app';
import { connectToMongoDB } from './config/database';
import { enirementVariables } from './config/environment';

/**
 * Starts the Express server and establishes a connection to MongoDB.
 * @async
 * @function startServer
 * @param {number} [port] - Optional port number to use (defaults to environment variable)
 * @returns {Promise<{server: any, db: any, client: any}>} Server, database, and client instances
 * @throws {Error} If the server fails to start or connect to the database
 */

async function startServer(port?: number) {
  try {
    await connectToMongoDB();

    const serverPort = port || enirementVariables.serverConfig.PORT;
    const server = app.listen(serverPort, () => {
      console.log(`🚀 Server is running on port ${serverPort}`);
    });

    const shutdown = async () => {
      console.log('🛑 Shutting down server...');
      server.close(async () => {
        console.log('🛑 Server closed');
        await import('mongoose').then((m) => m.disconnect());
        console.log('🛑 MongoDB connection closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}
