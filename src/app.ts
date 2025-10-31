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
import replyRoutes from './modules/replies/reply.routes';
import StatisticsRoutes from './modules/statistics/statistics.route';
import NotificationRoutes from './modules/notifications/notification.routes';
import {version} from "../package.json"
const app: Express = express();

app.use(cors());
app.use(express.json());
setupSwagger(app);

app.use('/api/v1', userRoutes);
app.use('/api/v1/articles', articleRoutes);
app.use('/api/v1/comments', commentRoutes);
app.use('/api/v1/replies', replyRoutes);
app.use('/api/v1/statistics', StatisticsRoutes);
app.use('/api/v1/notifications', NotificationRoutes);

app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    message: '🚀 Server is running successfully!',
    version,
    endpoints: {
      auth: '/api/v1/auth',
      articles: '/api/v1/articles',
      comments: '/api/v1/comments',
      replies: '/api/v1/replies',
      statistics: '/api/v1/statistics',
      notifications: '/api/v1/notifications'
    },
  });
});

export default app;
