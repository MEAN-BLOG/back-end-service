/**
 * @module modules/articles/article.model
 * @description Article schema definition for MongoDB using Mongoose
 */

import mongoose, { Schema } from 'mongoose';
import { IArticle } from '../shared/interfaces/schema.interface';

/**
 * @swagger
 * components:
 *   schemas:
 *     Article:
 *       type: object
 *       required:
 *         - title
 *         - content
 *         - userId
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated ID of the article
 *         title:
 *           type: string
 *           description: The article title
 *         content:
 *           type: string
 *           description: The article content
 *         image:
 *           type: string
 *           description: URL to the article image
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: List of tags for the article
 *         userId:
 *           type: string
 *           description: ID of the user who created the article
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the article was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date the article was last updated
 */
const articleSchema = new Schema<IArticle>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters long'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      trim: true,
      minlength: [10, 'Content must be at least 10 characters long'],
    },
    image: {
      type: String,
      trim: true,
      validate: {
        validator: function (v: string) {
          if (v) {
            return /^https?:\/\/.+/.test(v);
          }
          return true;
        },
        message: 'Image must be a valid URL',
      },
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: function (v: string[]) {
          return v.every((tag) => tag.trim().length >= 2 && tag.trim().length <= 30);
        },
        message: 'Each tag must be between 2 and 30 characters',
      },
    },
    commentIds: {
      type: [Schema.Types.ObjectId],
      ref: 'Comment',
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
 * Virtual for comment count
 */
articleSchema.virtual('commentCount').get(function () {
  return Array.isArray(this.commentIds) ? this.commentIds.length : 0;
});

/**
 * Virtual to populate author information
 */
articleSchema.virtual('author', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

/**
 * Virtual to populate comments
 */
articleSchema.virtual('comments', {
  ref: 'Comment',
  localField: 'commentIds',
  foreignField: '_id',
});

/**
 * Index for better query performance
 */
articleSchema.index({ title: 'text', content: 'text' });
articleSchema.index({ userId: 1 });
articleSchema.index({ tags: 1 });
articleSchema.index({ createdAt: -1 });
articleSchema.index({ commentIds: 1 });

/**
 * Static method to find articles by tag
 */
articleSchema.statics.findByTag = function (tag: string) {
  return this.find({ tags: { $in: [tag] } });
};

/**
 * Static method to find articles by author
 */
articleSchema.statics.findByAuthor = function (userId: mongoose.Types.ObjectId) {
  return this.find({ userId });
};

/**
 * Export the Article model
 */
export default mongoose.model<IArticle>('Article', articleSchema);
