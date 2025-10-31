import { NotificationType } from '@/modules/shared';
import { Types } from 'mongoose';

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
