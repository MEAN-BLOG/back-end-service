import { Types } from 'mongoose';

export enum NotificationType {
  NEW_COMMENT = 'NEW_COMMENT',
  NEW_REPLY = 'NEW_REPLY',
  COMMENT_LIKED = 'COMMENT_LIKED',
  REPLY_LIKED = 'REPLY_LIKED',
  ARTICLE_PUBLISHED = 'ARTICLE_PUBLISHED',
  MENTION = 'MENTION',
  SYSTEM = 'SYSTEM',
}

export interface INotification {
  userId: Types.ObjectId;
  type: NotificationType;
  message: string;
  referenceId: Types.ObjectId;
  referenceModel: 'Article' | 'Comment' | 'Reply' | 'User';
  read: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateNotificationDto {
  userId: Types.ObjectId | string;
  type: NotificationType;
  message: string;
  referenceId: Types.ObjectId | string;
  referenceModel: 'Article' | 'Comment' | 'Reply' | 'User';
  metadata?: Record<string, any>;
}

export interface MarkAsReadDto {
  notificationIds: string[];
  all?: boolean;
}

export interface NotificationFilters {
  read?: boolean;
  type?: NotificationType;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  page?: number;
}
