/**
 * @module modules/replies/reply.model
 * @description Reply schema definition for MongoDB using Mongoose with OpenAPI documentation
 * @openapi
 * components:
 *   schemas:
 *     Reply:
 *       type: object
 *       required:
 *         - content
 *         - userId
 *         - commentId
 *       properties:
 *         _id:
 *           type: string
 *           format: ObjectId
 *           description: The auto-generated ID of the reply
 *           example: 507f1f77bcf86cd799439011
 *         content:
 *           type: string
 *           minLength: 1
 *           maxLength: 500
 *           description: The content of the reply
 *           example: "This is a reply to the comment"
 *         userId:
 *           type: string
 *           format: ObjectId
 *           description: Reference to the user who created the reply
 *           example: 507f1f77bcf86cd799439012
 *         commentId:
 *           type: string
 *           format: ObjectId
 *           description: Reference to the parent comment
 *           example: 507f1f77bcf86cd799439013
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the reply was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date the reply was last updated
 *     CreateReplyInput:
 *       type: object
 *       required:
 *         - content
 *       properties:
 *         content:
 *           type: string
 *           minLength: 1
 *           maxLength: 500
 *           description: The content of the reply
 *           example: "This is a reply to the comment"
 *     UpdateReplyInput:
 *       type: object
 *       properties:
 *         content:
 *           type: string
 *           minLength: 1
 *           maxLength: 500
 *           description: The updated content of the reply
 *           example: "Updated reply content"
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
