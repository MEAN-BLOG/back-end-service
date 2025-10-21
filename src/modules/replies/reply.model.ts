/**
 * @module modules/replies/reply.model
 * @description Reply schema definition for MongoDB using Mongoose
 */

import mongoose, { Schema } from 'mongoose';
import { IReply } from '../shared/interfaces/schema.interface';

/**
 * Reply schema definition
 */
const replySchema = new Schema<IReply>(
  {
    content: {
      type: String,
      required: [true, 'Reply content is required'],
      trim: true,
      minlength: [1, 'Reply cannot be empty'],
      maxlength: [500, 'Reply cannot exceed 500 characters'],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required'],
    },
    commentId: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
      required: [true, 'Comment reference is required'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

/**
 * Virtual to populate author information
 */
replySchema.virtual('author', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

/**
 * Virtual to populate comment information
 */
replySchema.virtual('comment', {
  ref: 'Comment',
  localField: 'commentId',
  foreignField: '_id',
  justOne: true,
});

/**
 * Virtual to populate article information through comment
 */
replySchema.virtual('article').get(function () {
  return null;
});

/**
 * Index for better query performance
 */
replySchema.index({ commentId: 1 });
replySchema.index({ userId: 1 });
replySchema.index({ createdAt: -1 });

/**
 * Static method to find replies by comment
 */
replySchema.statics.findByComment = function (commentId: mongoose.Types.ObjectId) {
  return this.find({ commentId }).sort({ createdAt: 1 });
};

/**
 * Static method to find replies by user
 */
replySchema.statics.findByUser = function (userId: mongoose.Types.ObjectId) {
  return this.find({ userId }).sort({ createdAt: -1 });
};

/**
 * Export the Reply model
 */
export default mongoose.model<IReply>('Reply', replySchema);
