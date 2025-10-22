/**
 * @module modules/articles/article.routes
 * @description Article routes for handling article-related HTTP requests
 */

import { Router } from 'express';
import { validate } from '../../middlewares/validation.middleware';
import { authenticate } from '../../middlewares/auth.middleware';
import articleController from './article.controller';
import { createArticleSchema, updateArticleSchema } from './article.validation';
import { checkPermission, SubjectTypes } from '../../abilities/abilities';
import articleModel from './article.model';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Articles
 *   description: Article management and retrieval
 */

/**
 * @swagger
 * /articles:
 *   get:
 *     summary: Get paginated list of articles with filtering and search
 *     tags: [Articles]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of articles per page (max 100)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           example: "typescript"
 *         description: Search term to filter articles by title or content (case-insensitive)
 *       - in: query
 *         name: author
 *         schema:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *         description: Filter articles by author ID
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *           example: "programming"
 *         description: Filter articles by tag (case-sensitive)
 *     responses:
 *       200:
 *         description: List of articles retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginationResponse'
 *             example:
 *               data:
 *                 - _id: "507f1f77bcf86cd799439011"
 *                   title: "Getting Started with TypeScript"
 *                   content: "TypeScript is a typed superset of JavaScript..."
 *                   image: "https://example.com/images/typescript.jpg"
 *                   tags: ["typescript", "programming"]
 *                   userId: "507f1f77bcf86cd799439011"
 *                   commentIds: ["507f1f77bcf86cd799439012"]
 *                   createdAt: "2023-10-22T10:30:00.000Z"
 *                   updatedAt: "2023-10-22T10:30:00.000Z"
 *               pagination:
 *                 total: 1
 *                 page: 1
 *                 limit: 10
 *                 totalPages: 1
 *       400:
 *         description: |
 *           Bad Request:
 *           - Invalid page or limit value
 *           - Invalid author ID format
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Error message describing the issue"
 *                 error:
 *                   type: string
 *                   example: "Detailed error information"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Error message describing the issue"
 *                 error:
 *                   type: string
 *                   example: "Detailed error information"
 */
router.get('/', articleController.getArticles);

/**
 * @swagger
 * /articles/{id}:
 *   get:
 *     summary: Get a single article by ID
 *     tags: [Articles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *         description: Article ID
 *     responses:
 *       200:
 *         description: Article details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Article'
 *             example:
 *               _id: "507f1f77bcf86cd799439011"
 *               title: "Getting Started with TypeScript"
 *               content: "TypeScript is a typed superset of JavaScript that compiles to plain JavaScript..."
 *               image: "https://example.com/images/typescript.jpg"
 *               tags: ["typescript", "programming"]
 *               userId: "507f1f77bcf86cd799439011"
 *               commentIds: ["507f1f77bcf86cd799439012"]
 *               createdAt: "2023-10-22T10:30:00.000Z"
 *               updatedAt: "2023-10-22T10:30:00.000Z"
 *       400:
 *         description: Invalid article ID format
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Error message describing the issue"
 *                 error:
 *                   type: string
 *                   example: "Detailed error information"
 *       404:
 *         description: Article not found with the specified ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Error message describing the issue"
 *                 error:
 *                   type: string
 *                   example: "Detailed error information"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Error message describing the issue"
 *                 error:
 *                   type: string
 *                   example: "Detailed error information"
 */
router.get('/:id', articleController.getArticleById);

/**
 * @swagger
 * /articles:
 *   post:
 *     summary: Create a new article
 *     tags: [Articles]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 200
 *                 example: "Getting Started with TypeScript"
 *               content:
 *                 type: string
 *                 minLength: 10
 *                 example: "TypeScript is a typed superset of JavaScript that compiles to plain JavaScript..."
 *               image:
 *                 type: string
 *                 format: uri
 *                 example: "https://example.com/images/typescript.jpg"
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["typescript", "programming"]
 *     responses:
 *       201:
 *         description: Article created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Article'
 *             example:
 *               _id: "507f1f77bcf86cd799439011"
 *               title: "Getting Started with TypeScript"
 *               content: "TypeScript is a typed superset of JavaScript..."
 *               image: "https://example.com/images/typescript.jpg"
 *               tags: ["typescript", "programming"]
 *               userId: "507f1f77bcf86cd799439011"
 *               commentIds: []
 *               createdAt: "2023-10-22T10:30:00.000Z"
 *               updatedAt: "2023-10-22T10:30:00.000Z"
 *       400:
 *         description: |
 *           Bad Request:
 *           - Title is required and must be 5-200 characters
 *           - Content is required and must be at least 10 characters
 *           - Invalid image URL format
 *           - Tags must be an array of strings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Error message describing the issue"
 *                 error:
 *                   type: string
 *                   example: "Detailed error information"
 *       401:
 *         description: Unauthorized - Authentication token is missing or invalid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Error message describing the issue"
 *                 error:
 *                   type: string
 *                   example: "Detailed error information"
 *       403:
 *         description: Forbidden - User does not have permission to create articles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Error message describing the issue"
 *                 error:
 *                   type: string
 *                   example: "Detailed error information"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Error message describing the issue"
 *                 error:
 *                   type: string
 *                   example: "Detailed error information"
 */
router.post(
  '/',
  [authenticate, checkPermission('create', () => 'Article'), validate(createArticleSchema)],
  articleController.createArticle,
);
/**
 * @swagger
 * /articles/{id}:
 *   put:
 *     summary: Update an existing article
 *     tags: [Articles]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *         description: Article ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 200
 *                 example: "Advanced TypeScript Patterns"
 *               content:
 *                 type: string
 *                 minLength: 10
 *                 example: "Advanced TypeScript patterns for enterprise applications..."
 *               image:
 *                 type: string
 *                 format: uri
 *                 example: "https://example.com/images/advanced-typescript.jpg"
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["typescript", "advanced", "design-patterns"]
 *     responses:
 *       200:
 *         description: Article updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Article'
 *             example:
 *               _id: "507f1f77bcf86cd799439011"
 *               title: "Advanced TypeScript Patterns"
 *               content: "Advanced TypeScript patterns for enterprise applications..."
 *               image: "https://example.com/images/advanced-typescript.jpg"
 *               tags: ["typescript", "advanced", "design-patterns"]
 *               userId: "507f1f77bcf86cd799439011"
 *               commentIds: ["507f1f77bcf86cd799439012"]
 *               createdAt: "2023-10-22T10:30:00.000Z"
 *               updatedAt: "2023-10-22T11:30:00.000Z"
 *       400:
 *         description: |
 *           Bad Request:
 *           - At least one field to update is required
 *           - Title must be 5-200 characters
 *           - Content must be at least 10 characters
 *           - Invalid image URL format
 *           - Tags must be an array of strings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Error message describing the issue"
 *                 error:
 *                   type: string
 *                   example: "Detailed error information"
 *       401:
 *         description: Unauthorized - Authentication token is missing or invalid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Error message describing the issue"
 *                 error:
 *                   type: string
 *                   example: "Detailed error information"
 *       403:
 *         description: Forbidden - User is not the author of the article or an admin
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Error message describing the issue"
 *                 error:
 *                   type: string
 *                   example: "Detailed error information"
 *       404:
 *         description: Article not found with the specified ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Error message describing the issue"
 *                 error:
 *                   type: string
 *                   example: "Detailed error information"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Error message describing the issue"
 *                 error:
 *                   type: string
 *                   example: "Detailed error information"
 */
router.put(
  '/:id',
  authenticate,
  checkPermission('update', async (req) => {
    const article = await articleModel.findById(req?.params.id).exec();
    if (!article) return 'Article';
    return {
      ...article.toObject(),
      _id: String(article._id),
      userId: article.userId.toString(),
      baseModelName: 'Article',
    } as unknown as Promise<SubjectTypes>;
  }),
  validate(updateArticleSchema),
  articleController.updateArticle,
);
/**
 * @swagger
 * /articles/{id}:
 *   delete:
 *     summary: Delete an article (Admin only)
 *     tags: [Articles]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Article ID to delete
 *     responses:
 *       200:
 *         description: Article deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Article not found
 */
router.delete(
  '/:id',
  authenticate,
  checkPermission('delete', () => {
    return 'Article';
  }),
  articleController.deleteArticle,
);

export default router;
