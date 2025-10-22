/**
 * @module app
 * @description Main application entry point.
 * This module configures and initializes the Express application with middleware and routes.
 */

import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { setupSwagger } from './config/swagger';
import userRoutes from './modules/users/user.routes';
import articleRoutes from './modules/articles/article.routes';
import commentRoutes from './modules/comments/comment.routes';

const app: Express = express();

app.use(cors());
app.use(express.json());
setupSwagger(app);

app.use('/api/v1', userRoutes);
app.use('/api/v1/articles', articleRoutes);
app.use('/api/v1/comments', commentRoutes);

app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    message: '🚀 Server is running successfully!',
    version: '1.0.1',
    endpoints: {
      auth: '/api/v1/auth',
    },
  });
});

export default app;
