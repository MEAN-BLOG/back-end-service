/**
 * @module app
 * @description Main application entry point.
 * This module configures and initializes the Express application with middleware and routes.
 */

import express, { Express, Request, Response } from 'express';
import cors from 'cors';

// Create Express application instance
const app: Express = express();

// Enable CORS for all origins (development)
app.use(cors());

// Parse incoming JSON requests
app.use(express.json());

// Root route to check server status
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({ message: '🚀 Server is running successfully!' });
});

// Export the app for server startup
export default app;
