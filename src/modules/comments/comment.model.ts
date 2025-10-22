/**
 * @module modules/comments/comment.model
 * @description Comment schema definition for MongoDB using Mongoose
 */

import mongoose, { Schema } from 'mongoose';
import { IComment } from '../shared/interfaces/schema.interface';

/**
 * @openapi
 * components:
 *   schemas:
 *     Comment:
 *       type: object
 *       required:
 *         - content
 *         - articleId
 *         - userId
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the comment
 *           example: "507f1f77bcf86cd799439011"
 *         content:
 *           type: string
 *           description: The comment text content
 *           minLength: 1
 *           maxLength: 1000
 *           example: "This is an insightful comment about the article."
 *         articleId:
 *           type: string
 *           description: Reference to the article this comment belongs to
 *           example: "507f1f77bcf86cd799439012"
 *         userId:
 *           type: string
 *           description: Reference to the user who created the comment
 *           example: "507f1f77bcf86cd799439013"
 *         replyIds:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of reply IDs
 *           example: ["507f1f77bcf86cd799439014", "507f1f77bcf86cd799439015"]
 *         replyCount:
 *           type: integer
 *           description: Number of replies to this comment (virtual field)
 *           example: 2
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the comment was created
 *           example: "2023-10-22T09:30:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the comment was last updated
 *           example: "2023-10-22T09:30:00.000Z"
 */
const commentSchema = new Schema<IComment>(
  {
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      trim: true,
      minlength: [1, 'Comment cannot be empty'],
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    articleId: {
      type: Schema.Types.ObjectId,
      ref: 'Article',
      required: [true, 'Article reference is required'],
    },
    replyIds: {
      type: [Schema.Types.ObjectId],
      ref: 'Reply',
      default: [],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

/**
 * Virtual for reply count
 */
commentSchema.virtual('replyCount').get(function () {
  return this.replyIds.length;
});

/**
 * Virtual to populate author information
 */
commentSchema.virtual('author', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

/**
 * Virtual to populate article information
 */
commentSchema.virtual('article', {
  ref: 'Article',
  localField: 'articleId',
  foreignField: '_id',
  justOne: true,
});

/**
 * Virtual to populate replies
 */
commentSchema.virtual('replies', {
  ref: 'Reply',
  localField: 'replyIds',
  foreignField: '_id',
});

/**
 * Index for better query performance
 */
commentSchema.index({ articleId: 1 });
commentSchema.index({ userId: 1 });
commentSchema.index({ createdAt: -1 });
commentSchema.index({ replyIds: 1 });

/**
 * Static method to find comments by article
 */
commentSchema.statics.findByArticle = function (articleId: mongoose.Types.ObjectId) {
  return this.find({ articleId }).sort({ createdAt: 1 });
};

/**
 * Static method to find comments by user
 */
commentSchema.statics.findByUser = function (userId: mongoose.Types.ObjectId) {
  return this.find({ userId }).sort({ createdAt: -1 });
};

/**
 * Export the Comment model
 */
export default mongoose.model<IComment>('Comment', commentSchema);
