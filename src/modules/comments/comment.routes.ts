/**
 * @module modules/comments/comment.routes
 * @description Comment routes for handling comment-related HTTP requests
 */

import { Router } from 'express';
import { validate } from '../../middlewares/validation.middleware';
import { authenticate } from '../../middlewares/auth.middleware';
import commentController from './comment.controller';
import { createCommentSchema, updateCommentSchema } from './comment.validation';
import { checkPermission } from '../../abilities/abilities';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: Comment management and retrieval
 */

/**
 * @swagger
 * /comments/articles/{articleId}:
 *   post:
 *     summary: Create a new comment on an article
 *     tags: [Comments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: articleId
 *         required: true
 *         schema:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *         description: ID of the article to comment on
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 1000
 *                 example: "This is a great article!"
 *     responses:
 *       201:
 *         description: Comment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       400:
 *         description: |
 *           Bad Request:
 *           - Content is required
 *           - Content must be between 1 and 1000 characters
 *           - Invalid article ID format
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
 *         description: Forbidden - User does not have permission to comment
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
router.post(
  '/articles/:articleId',
  authenticate,
  validate(createCommentSchema),
  checkPermission('create', () => 'Comment'),
  commentController.createComment,
);

/**
 * @swagger
 * /comments/articles/{articleId}:
 *   get:
 *     summary: Get all comments for an article with pagination
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: articleId
 *         required: true
 *         schema:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *         description: ID of the article to get comments for
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
 *         description: Number of comments per page (max 100)
 *     responses:
 *       200:
 *         description: List of comments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginationResponse'
 *             example:
 *               data:
 *                 - _id: "507f1f77bcf86cd799439012"
 *                   content: "Great article!"
 *                   articleId: "507f1f77bcf86cd799439011"
 *                   userId: "507f1f77bcf86cd799439013"
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
 *           - Invalid article ID format
 *           - Invalid page or limit value
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
router.get('/articles/:articleId', commentController.getComments);

/**
 * @swagger
 * /comments/{id}:
 *   get:
 *     summary: Get a comment by ID
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "507f1f77bcf86cd799439012"
 *         description: Comment ID
 *     responses:
 *       200:
 *         description: Comment retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *             example:
 *               _id: "507f1f77bcf86cd799439012"
 *               content: "This is a great article!"
 *               articleId: "507f1f77bcf86cd799439011"
 *               userId: "507f1f77bcf86cd799439013"
 *               replyIds: []
 *               createdAt: "2023-10-22T10:30:00.000Z"
 *               updatedAt: "2023-10-22T10:30:00.000Z"
 *       400:
 *         description: Invalid comment ID format
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
 *         description: Comment not found with the specified ID
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
router.get('/:id', commentController.getCommentById);

/**
 * @swagger
 * /comments/{id}:
 *   patch:
 *     summary: Update a comment
 *     tags: [Comments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "507f1f77bcf86cd799439012"
 *         description: Comment ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 1000
 *                 example: "Updated comment content"
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *             example:
 *               _id: "507f1f77bcf86cd799439012"
 *               content: "Updated comment content"
 *               articleId: "507f1f77bcf86cd799439011"
 *               userId: "507f1f77bcf86cd799439013"
 *               replyIds: []
 *               createdAt: "2023-10-22T10:30:00.000Z"
 *               updatedAt: "2023-10-22T10:35:00.000Z"
 *       400:
 *         description: |
 *           Bad Request:
 *           - Content is required
 *           - Content must be between 1 and 1000 characters
 *           - Invalid comment ID format
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
 *         description: Forbidden - User is not the author of the comment
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
 *         description: Comment not found with the specified ID
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
router.patch(
  '/:id',
  authenticate,
  validate(updateCommentSchema),
  checkPermission('update', () => 'Comment'),
  commentController.updateComment,
);

/**
 * @swagger
 * /comments/{id}:
 *   delete:
 *     summary: Delete a comment
 *     tags: [Comments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "507f1f77bcf86cd799439012"
 *         description: Comment ID to delete
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 'Comment deleted successfully'
 *       400:
 *         description: Invalid comment ID format
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
 *         description: Forbidden - User is not the author of the comment or an admin
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
 *         description: Comment not found with the specified ID
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
router.delete(
  '/:id',
  authenticate,
  checkPermission('delete', () => 'Comment'),
  commentController.deleteComment,
);

export default router;
