import { Router } from 'express';
import { checkPermission } from '../../abilities/abilities';
import notificationController from './notification.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Notifications module management
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     # ========================================================
 *     # Notification
 *     # ========================================================
 *     Notification:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "507f1f77bcf86cd799439012"
 *         content:
 *           type: string
 *           example: "You have a new comment on your post."
 *         userId:
 *           type: string
 *           example: "507f1f77bcf86cd799439013"
 *         seen:
 *           type: boolean
 *           example: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-10-22T10:30:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2025-10-22T10:30:00.000Z"
 *       required:
 *         - _id
 *         - content
 *         - userId
 *         - seen
 *         - createdAt
 *         - updatedAt

 *     # ========================================================
 *     # PaginationResponse
 *     # ========================================================
 *     PaginationResponse:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *           example: 25
 *           description: Total number of items available
 *         page:
 *           type: integer
 *           example: 1
 *           description: Current page number
 *         limit:
 *           type: integer
 *           example: 10
 *           description: Number of items per page
 *         totalPages:
 *           type: integer
 *           example: 3
 *           description: Total number of pages based on total and limit
 */

/**
 * @openapi
 * /notifications:
 *   get:
 *     tags: [Notifications]
 *     summary: Get a paginated list of notifications for the user
 *     security:
 *       - BearerAuth: []
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
 *         description: Number of notifications per page (max 100)
 *     responses:
 *       200:
 *         description: List of notifications retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Notification'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationResponse'
 *             example:
 *               data:
 *                 - _id: "507f1f77bcf86cd799439012"
 *                   content: "You have a new comment on your post."
 *                   userId: "507f1f77bcf86cd799439013"
 *                   seen: false
 *                   createdAt: "2023-10-22T10:30:00.000Z"
 *                   updatedAt: "2023-10-22T10:30:00.000Z"
 *               pagination:
 *                 total: 25
 *                 page: 1
 *                 limit: 10
 *                 totalPages: 3
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: 'error'
 *               message: 'Authentication required'
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
router.get('/', authenticate, notificationController.getNotifications);

/**
 * @openapi
 * /notifications/{id}:
 *   patch:
 *     tags: [Notifications]
 *     summary: Mark a notification as seen
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "507f1f77bcf86cd799439012"
 *         description: ID of the notification to mark as seen
 *
 *     responses:
 *       200:
 *         description: Notification marked as seen successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notification'
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: 'error'
 *               message: 'Invalid notification ID format'
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
 *               message: 'You do not have permission to update this notification'
 *       404:
 *         description: Not Found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: 'error'
 *               message: 'Notification not found with the specified ID'
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
router.patch(
  '/:id',
  authenticate,
  checkPermission('update', () => 'Notification'),
  notificationController.markNotificationAsSeen,
);

export default router;
