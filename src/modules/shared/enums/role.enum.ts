/**
 * @module shared/enums/role.enum
 * @description User role enumeration used across the application
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     UserRole:
 *       type: string
 *       enum:
 *         - guest
 *         - writer
 *         - editor
 *         - admin
 *       description: User roles enumeration defining permissions in the system.
 */
export enum UserRole {
  GUEST = 'guest',
  WRITER = 'writer',
  EDITOR = 'editor',
  ADMIN = 'admin',
}
