import { Router } from 'express';
import { checkPermission } from '../../abilities/abilities';
import replyController from './reply.controller';
import { createReplySchema, updateReplySchema } from './reply.validation';
import { authenticate } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validation.middleware';

const router = Router();

/**
 * @openapi
 * /replies/comments/{commentId}:
 *   post:
 *     tags: [Replies]
 *     summary: Create a new reply to a comment
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *         description: ID of the comment to reply to
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
 *                 maxLength: 500
 *                 example: "This is a reply to your comment"
 *     responses:
 *       201:
 *         description: Reply created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reply'
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: 'error'
 *               message: 'Invalid input data'
 *               errors:
 *                 - field: 'content'
 *                   message: 'Content is required'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: 'error'
 *               message: 'Authentication required'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: 'error'
 *               message: 'You do not have permission to create a reply'
 *       404:
 *         description: Not Found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: 'error'
 *               message: 'Comment not found with the specified ID'
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: 'error'
 *               message: 'An unexpected error occurred'
 */
router.post(
  '/comments/:commentId',
  authenticate,
  validate(createReplySchema),
  checkPermission('create', () => 'Reply'),
  replyController.createReply,
);

/**
 * @openapi
 * /replies/comments/{commentId}:
 *   get:
 *     tags: [Replies]
 *     summary: Get all replies for a comment with pagination
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *         description: ID of the comment to get replies for
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
 *         description: Number of replies per page (max 100)
 *     responses:
 *       200:
 *         description: List of replies retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Reply'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationResponse'
 *             example:
 *               data:
 *                 - _id: "507f1f77bcf86cd799439012"
 *                   content: "This is a reply"
 *                   commentId: "507f1f77bcf86cd799439011"
 *                   userId: "507f1f77bcf86cd799439013"
 *                   createdAt: "2023-10-22T10:30:00.000Z"
 *                   updatedAt: "2023-10-22T10:30:00.000Z"
 *               pagination:
 *                 total: 1
 *                 page: 1
 *                 limit: 10
 *                 totalPages: 1
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: 'error'
 *               message: 'Invalid comment ID format'
 *       404:
 *         description: Not Found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: 'error'
 *               message: 'Comment not found with the specified ID'
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: 'error'
 *               message: 'An unexpected error occurred'
 */
router.get('/comments/:commentId', replyController.getRepliesByComment);

/**
 * @openapi
 * /replies/{id}:
 *   get:
 *     tags: [Replies]
 *     summary: Get a single reply by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "507f1f77bcf86cd799439012"
 *         description: ID of the reply to retrieve
 *     responses:
 *       200:
 *         description: Reply details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reply'
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: 'error'
 *               message: 'Invalid reply ID format'
 *       404:
 *         description: Not Found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: 'error'
 *               message: 'Reply not found with the specified ID'
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: 'error'
 *               message: 'An unexpected error occurred'
 */
router.get('/:id', replyController.getReply);

/**
 * @openapi
 * /replies/{id}:
 *   put:
 *     tags: [Replies]
 *     summary: Update a reply
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "507f1f77bcf86cd799439012"
 *         description: ID of the reply to update
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
 *                 maxLength: 500
 *                 example: "Updated reply content"
 *     responses:
 *       200:
 *         description: Reply updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reply'
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: 'error'
 *               message: 'Validation failed'
 *               errors:
 *                 - field: 'content'
 *                   message: 'Content must be between 1 and 500 characters'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: 'error'
 *               message: 'Authentication required'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: 'error'
 *               message: 'You do not have permission to update this reply'
 *       404:
 *         description: Not Found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: 'error'
 *               message: 'Reply not found with the specified ID'
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: 'error'
 *               message: 'An unexpected error occurred'
 */
router.put(
  '/:id',
  authenticate,
  validate(updateReplySchema),
  checkPermission('update', () => 'Reply'),
  replyController.updateReply,
);

/**
 * @openapi
 * /replies/{id}:
 *   delete:
 *     tags: [Replies]
 *     summary: Delete a reply
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "507f1f77bcf86cd799439012"
 *         description: ID of the reply to delete
 *     responses:
 *       200:
 *         description: Reply deleted successfully
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
 *                   example: "Reply deleted successfully"
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: 'error'
 *               message: 'Invalid reply ID format'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: 'error'
 *               message: 'Authentication required'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: 'error'
 *               message: 'You do not have permission to delete this reply'
 *       404:
 *         description: Not Found
 *         content:
 *           application/json:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: 'error'
 *               message: 'Reply not found with the specified ID'
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: 'error'
 *               message: 'An unexpected error occurred'
 */
router.delete(
  '/:id',
  authenticate,
  checkPermission('delete', () => 'Reply'),
  replyController.deleteReply,
);

export default router;
