/**
 * @module shared/interfaces/schema.interface
 * @description Centralized schema interfaces for all MongoDB models
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
}
