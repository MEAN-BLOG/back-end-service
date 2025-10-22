import { Server as SocketIOServer } from 'socket.io';
import { Types } from 'mongoose';
import Notification from './notification.model';
import {
  CreateNotificationDto,
  NotificationType,
  INotification as INotificationType,
} from '../../shared/types/notification.types';

class NotificationService {
  private io: SocketIOServer | null = null;

  /**
   * Initialize the Socket.IO server for notifications
   */
  public initialize(io: SocketIOServer): void {
    this.io = io;
    this.setupSocketEvents();
  }

  /**
   * Setup Socket.IO event listeners
   */
  private setupSocketEvents(): void {
    if (!this.io) return;

    this.io.on('connection', (socket) => {
      console.log(`New client connected: ${socket.id}`);

      // Join user's room for private notifications
      socket.on('join', (userId: string) => {
        socket.join(`user_${userId}`);
        console.log(`User ${userId} joined their notification room`);
      });

      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
      });
    });
  }

  /**
   * Create a new notification and emit it via Socket.IO
   */
  public async createAndEmitNotification(
    createDto: CreateNotificationDto,
  ): Promise<INotificationType> {
    try {
      // Create and save the notification
      const notificationData = {
        userId: createDto.userId,
        type: createDto.type,
        message: createDto.message,
        referenceId: createDto.referenceId,
        referenceModel: createDto.referenceModel,
        metadata: createDto.metadata || {},
        read: false,
      };

      const notification = await Notification.create(notificationData);

      // Create the notification object to emit
      const notificationToEmit: INotificationType = {
        ...notification.toObject(),
        message: notification.message,
        userId: new Types.ObjectId(notification.userId),
        referenceId: new Types.ObjectId(notification.referenceId),
        referenceModel: createDto.referenceModel,
        read: notification.read,
        createdAt: notification.createdAt,
        updatedAt: notification.updatedAt,
        type: createDto.type,
      };

      // Emit the notification to the user
      this.emitNotification(notificationToEmit);

      return notificationToEmit;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw new Error('Failed to create notification');
    }
  }

  /**
   * Emit a notification to a specific user via Socket.IO
   */
  private emitNotification(notification: INotificationType): void {
    if (!this.io) {
      console.warn('Socket.IO server not initialized. Notification not emitted.');
      return;
    }

    // Ensure userId is a string for the room name
    const userId =
      typeof notification.userId === 'string'
        ? notification.userId
        : notification.userId.toString();

    // Emit to the specific user's room
    this.io.to(`user_${userId}`).emit('new_notification', notification);
  }

  /**
   * Get user notifications with pagination and filters
   */
  public async getNotifications(
    userId: string | Types.ObjectId,
    filters: {
      read?: boolean;
      type?: NotificationType;
      startDate?: Date | string;
      endDate?: Date | string;
      limit?: number;
      page?: number;
    } = {},
  ): Promise<INotificationType[]> {
    const query: any = { userId };

    if (filters.read !== undefined) {
      query.read = filters.read;
    }

    if (filters.type) {
      query.type = filters.type;
    }

    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) {
        query.createdAt.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        query.createdAt.$lte = new Date(filters.endDate);
      }
    }

    const notifications = (await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(filters.limit || 50)
      .skip(((filters.page || 1) - 1) * (filters.limit || 50))
      .lean()) as unknown as INotificationType[];

    return notifications.map((notification) => ({
      ...notification,
      userId: new Types.ObjectId(notification.userId),
      referenceId: new Types.ObjectId(notification.referenceId),
    }));
  }
}

export default new NotificationService();
