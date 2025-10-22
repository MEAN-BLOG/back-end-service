/**
 * @module server
 * @description Main server entry point.
 * This module initializes the Express application and establishes a connection to MongoDB.
 */

import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from './app';
import { connectToMongoDB } from './config/database';
import { enirementVariables } from './config/environment';
import notificationService from './modules/notifications/notification.service';

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

    // Create HTTP server
    const server = createServer(app);

    // Initialize Socket.IO
    const io = new SocketIOServer(server, {
      cors: {
        origin: enirementVariables.serverConfig.CLIENT_URL,
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    // Initialize notification service with Socket.IO
    notificationService.initialize(io);

    const serverPort = port || enirementVariables.serverConfig.PORT;
    server.listen(serverPort, () => {
      console.log(`🚀 Server is running on port ${serverPort}`);
      console.log(`🌐 WebSocket server is running`);
    });

    const shutdown = async () => {
      console.log('🛑 Shutting down server...');

      // Close Socket.IO connections
      io.close(() => {
        console.log('🛑 Socket.IO server closed');
      });

      server.close(async () => {
        console.log('🛑 HTTP server closed');
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
