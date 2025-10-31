/**
 * @module modules/notifications/notification.model
 * @description Notification schema definition for MongoDB using Mongoose
 */

import mongoose, { Schema } from 'mongoose';
import { NotificationType, INotification } from '../shared/';

/**
 * Notification schema definition
 */
const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: [true, 'Notification type is required'],
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
      maxlength: [500, 'Notification message cannot exceed 500 characters'],
    },
    referenceId: {
      type: Schema.Types.ObjectId,
      required: function () {
        return this.type === NotificationType.COMMENT || this.type === NotificationType.REPLY;
      },
      refPath: 'referenceModel',
    },
    read: {
      type: Boolean,
      default: false,
    },
    metadata: {
      type: Map,
      of: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

/**
 * Virtual for reference model determination
 */
notificationSchema.virtual('referenceModel').get(function () {
  switch (this.type) {
    case NotificationType.COMMENT:
      return 'Comment';
    case NotificationType.REPLY:
      return 'Reply';
    default:
      return null;
  }
});

/**
 * Virtual to populate user information
 */
notificationSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

/**
 * Virtual to populate reference information based on type
 */
notificationSchema.virtual('reference').get(function () {
  if (!this.referenceId) return null;

  switch (this.type) {
    case NotificationType.COMMENT:
      return { ref: 'Comment', id: this.referenceId };
    case NotificationType.REPLY:
      return { ref: 'Reply', id: this.referenceId };
    default:
      return null;
  }
});

/**
 * Index for better query performance
 */
notificationSchema.index({ userId: 1 });
notificationSchema.index({ read: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ userId: 1, read: 1 });
notificationSchema.index({ type: 1 });

/**
 * Static method to find notifications by user
 */
notificationSchema.statics.findByUser = function (userId: mongoose.Types.ObjectId) {
  return this.find({ userId }).sort({ createdAt: -1 });
};

/**
 * Static method to find unread notifications by user
 */
notificationSchema.statics.findUnreadByUser = function (userId: mongoose.Types.ObjectId) {
  return this.find({ userId, read: false }).sort({ createdAt: -1 });
};

/**
 * Static method to find notifications by type
 */
notificationSchema.statics.findByType = function (type: NotificationType) {
  return this.find({ type }).sort({ createdAt: -1 });
};

/**
 * Static method to mark notification as read
 */
notificationSchema.statics.markAsRead = function (notificationId: mongoose.Types.ObjectId) {
  return this.findByIdAndUpdate(notificationId, { read: true }, { new: true });
};

/**
 * Static method to mark all user's notifications as read
 */
notificationSchema.statics.markAllAsRead = function (userId: mongoose.Types.ObjectId) {
  return this.updateMany({ userId, read: false }, { read: true });
};

/**
 * Export the Notification model
 */
export default mongoose.model<INotification>('Notification', notificationSchema);
