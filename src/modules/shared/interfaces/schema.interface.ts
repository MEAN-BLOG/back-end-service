/**
 * @module shared/interfaces/schema.interface
 * @description Centralized schema interfaces for all MongoDB models
 *
 * @openapi
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - email
 *         - password
 *         - role
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the user
 *           example: "507f1f77bcf86cd799439011"
 *         firstName:
 *           type: string
 *           description: User's first name
 *           example: "John"
 *         lastName:
 *           type: string
 *           description: User's last name
 *           example: "Doe"
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address (must be unique)
 *           example: "john.doe@example.com"
 *         role:
 *           $ref: '#/components/schemas/UserRole'
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the user was created
 *           example: "2023-10-22T09:30:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the user was last updated
 *           example: "2023-10-22T09:30:00.000Z"
 *
 *     Article:
 *       type: object
 *       required:
 *         - title
 *         - content
 *         - userId
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the article
 *           example: "507f1f77bcf86cd799439012"
 *         title:
 *           type: string
 *           description: Article title
 *           minLength: 5
 *           maxLength: 200
 *           example: "Getting Started with TypeScript"
 *         content:
 *           type: string
 *           description: Article content in markdown format
 *           minLength: 10
 *           example: "TypeScript is a typed superset of JavaScript..."
 *         image:
 *           type: string
 *           description: URL to the article's featured image
 *           example: "https://example.com/images/typescript.jpg"
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of tags for categorization
 *           example: ["typescript", "programming"]
 *         commentIds:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of comment IDs
 *           example: ["507f1f77bcf86cd799439013"]
 *         userId:
 *           type: string
 *           description: Reference to the author's user ID
 *           example: "507f1f77bcf86cd799439011"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2023-10-22T09:30:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2023-10-22T09:30:00.000Z"
 *
 *     Reply:
 *       type: object
 *       required:
 *         - content
 *         - userId
 *         - commentId
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the reply
 *           example: "507f1f77bcf86cd799439015"
 *         content:
 *           type: string
 *           description: The reply text content
 *           minLength: 1
 *           maxLength: 1000
 *           example: "I completely agree with your point!"
 *         userId:
 *           type: string
 *           description: Reference to the user who created the reply
 *           example: "507f1f77bcf86cd799439011"
 *         commentId:
 *           type: string
 *           description: Reference to the parent comment
 *           example: "507f1f77bcf86cd799439014"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2023-10-22T09:30:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2023-10-22T09:30:00.000Z"
 *
 *     Notification:
 *       type: object
 *       required:
 *         - userId
 *         - type
 *         - message
 *         - read
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the notification
 *           example: "507f1f77bcf86cd799439016"
 *         userId:
 *           type: string
 *           description: Reference to the user who receives the notification
 *           example: "507f1f77bcf86cd799439011"
 *         type:
 *           $ref: '#/components/schemas/NotificationType'
 *         message:
 *           type: string
 *           description: The notification message
 *           example: "Your article has been published!"
 *         referenceId:
 *           type: string
 *           description: Optional reference ID (e.g., article ID, comment ID)
 *           example: "507f1f77bcf86cd799439012"
 *         read:
 *           type: boolean
 *           description: Whether the notification has been read
 *           default: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2023-10-22T09:30:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2023-10-22T09:30:00.000Z"
 */

import mongoose, { Document } from 'mongoose';
import { UserRole } from '../enums/role.enum';
import { NotificationType } from '../enums/notification-type.enum';

/**
 * User interface representing the user document structure
 */
export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

/**
 * Article interface representing the article document structure
 */
export interface IArticle extends Document {
  title: string;
  content: string;
  image?: string;
  tags?: string[];
  commentIds: mongoose.Types.ObjectId[];
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Comment interface representing the comment document structure
 */
export interface IComment extends Document {
  content: string;
  articleId: mongoose.Types.ObjectId;
  replyIds: mongoose.Types.ObjectId[];
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Reply interface representing the reply document structure
 */
export interface IReply extends Document {
  content: string;
  userId: mongoose.Types.ObjectId;
  commentId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Notification interface representing the notification document structure
 */
export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: NotificationType;
  message: string;
  referenceId?: mongoose.Types.ObjectId;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Map<string, string>;
}
