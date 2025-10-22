/**
 * @module shared/enums/notification-type.enum
 * @description Notification type enumeration used across the application
 *
 * @openapi
 * components:
 *   schemas:
 *     NotificationType:
 *       type: string
 *       enum: [comment, reply, system]
 *       description: |
 *         Type of notification:
 *         - `comment` - Notification about a new comment
 *         - `reply` - Notification about a reply to a comment
 *         - `system` - General system notification
 *       example: "comment"
 */

/**
 * Notification types enumeration
 */
export enum NotificationType {
  /** Notification about a new comment */
  COMMENT = 'comment',
  /** Notification about a reply to a comment */
  REPLY = 'reply',
  /** General system notification */
  SYSTEM = 'system',
}
