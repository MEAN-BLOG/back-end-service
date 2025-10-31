/**
 * @module modules/notifications/notification.controller
 * @description Notification controller for handling HTTP requests related to notifications
 */

import { Request, Response } from 'express';
import { Types } from 'mongoose';
import notificationService from './notification.service';

interface AuthenticatedRequest extends Request {
  user: {
    _id: Types.ObjectId;
    role: string;
  };
}

/**
 * Get all notifications with optional filtering and pagination
 */
export async function getNotifications(req: Request, res: Response) {
  try {
    const user = (req as AuthenticatedRequest).user;
    const { page = '1', limit = '10' } = req.query;
    const filters = {
      page: Number.parseInt(page as string, 10),
      limit: Math.min(Number.parseInt(limit as string, 10), 100),
    };
    const items = await notificationService.getNotifications(user._id, filters);

    res.status(200).json({
      success: true,
      message: 'Notifications retrieved successfully',
      data: items,
    });
  } catch (error) {
    console.error('Error getting notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve notifications',
    });
  }
}

/**
 * Mark a notification as seen
 */
export async function markNotificationAsSeen(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = (req as AuthenticatedRequest).user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const notification = await notificationService.markNotificationAsSeen(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found or not authorized',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification marked as seen successfully',
    });
  } catch (error) {
    console.error('Error marking notification as seen:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as seen',
    });
  }
}

export default {
  getNotifications,
  markNotificationAsSeen,
};
