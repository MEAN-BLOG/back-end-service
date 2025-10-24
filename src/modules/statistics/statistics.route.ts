/**
 * @module modules/statistics/statistics.routes
 * @description Separated routes for blog statistics by chart/data type
 */

import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { checkPermission } from '../../abilities/abilities';
import statisticsController from './statistics.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Statistics
 *   description: Blog overview & analytics
 */

/**
 * @swagger
 * /statistics/overview:
 *   get:
 *     summary: Get overview counters for the blog
 *     tags: [Statistics]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Overview statistics fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalArticles:
 *                   type: integer
 *                 totalAuthors:
 *                   type: integer
 *                 totalComments:
 *                   type: integer
 *                 totalTags:
 *                   type: integer
 */
router.get(
  '/overview',
  authenticate,
  checkPermission('read', () => 'Statistics'),
  statisticsController.getOverview,
);

/**
 * @swagger
 * /statistics/articles/monthly:
 *   get:
 *     summary: Get articles published per month
 *     tags: [Statistics]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Monthly article statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   date:
 *                     type: string
 *                     example: "2025-10"
 *                   count:
 *                     type: integer
 */
router.get(
  '/articles/monthly',
  authenticate,
  checkPermission('read', () => 'Statistics'),
  statisticsController.getArticlesPerMonth,
);

/**
 * @swagger
 * /statistics/articles/average:
 *   get:
 *     summary: Get average articles per author
 *     tags: [Statistics]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Average articles per author statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalArticles:
 *                   type: integer
 *                 totalAuthors:
 *                   type: integer
 *                 averagePerAuthor:
 *                   type: number
 */
router.get(
  '/articles/average',
  authenticate,
  checkPermission('read', () => 'Statistics'),
  statisticsController.getAverageArticlesPerAuthor,
);

/**
 * @swagger
 * /statistics/articles/top-viewed:
 *   get:
 *     summary: Get top 5 most viewed articles
 *     tags: [Statistics]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Top viewed articles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   title:
 *                     type: string
 *                   views:
 *                     type: integer
 *                   coverImage:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 */
router.get(
  '/articles/top-viewed',
  authenticate,
  checkPermission('read', () => 'Statistics'),
  statisticsController.getTopViewedArticles,
);

/**
 * @swagger
 * /statistics/articles/most-commented:
 *   get:
 *     summary: Get top 5 most commented articles
 *     tags: [Statistics]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Most commented articles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   title:
 *                     type: string
 *                   commentCount:
 *                     type: integer
 *                   coverImage:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 */
router.get(
  '/articles/most-commented',
  authenticate,
  checkPermission('read', () => 'Statistics'),
  statisticsController.getMostCommentedArticles,
);

/**
 * @swagger
 * /statistics/tags/top:
 *   get:
 *     summary: Get top tags used in articles
 *     tags: [Statistics]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Top tags with usage counts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   tag:
 *                     type: string
 *                   count:
 *                     type: integer
 */
router.get(
  '/tags/top',
  authenticate,
  checkPermission('read', () => 'Statistics'),
  statisticsController.getTopTags,
);

/**
 * @swagger
 * /statistics/authors/top:
 *   get:
 *     summary: Get top authors by number of articles
 *     tags: [Statistics]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Top authors
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   authorId:
 *                     type: string
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *                   articleCount:
 *                     type: integer
 */
router.get(
  '/authors/top',
  authenticate,
  checkPermission('read', () => 'Statistics'),
  statisticsController.getTopAuthors,
);

/**
 * @swagger
 * /statistics/authors/frequency:
 *   get:
 *     summary: Get average articles per author per month
 *     tags: [Statistics]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Author publish frequency
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   authorId:
 *                     type: string
 *                   name:
 *                     type: string
 *                   avgPerMonth:
 *                     type: number
 */
router.get(
  '/authors/frequency',
  authenticate,
  checkPermission('read', () => 'Statistics'),
  statisticsController.getAuthorFrequency,
);

/**
 * @swagger
 * /statistics/authors/trend:
 *   get:
 *     summary: Get article creation trends per author (monthly)
 *     tags: [Statistics]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Author monthly trends
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   authorId:
 *                     type: string
 *                   authorName:
 *                     type: string
 *                   month:
 *                     type: integer
 *                   year:
 *                     type: integer
 *                   count:
 *                     type: integer
 */
router.get(
  '/authors/trend',
  authenticate,
  checkPermission('read', () => 'Statistics'),
  statisticsController.getAuthorTrends,
);

export default router;
