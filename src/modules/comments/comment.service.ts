/**
 * @module modules/comments/comment.service
 * @description Comment service for handling business logic
 */

import { Types } from 'mongoose';
import Comment from './comment.model';
import Article from '../articles/article.model';
import { IComment } from '../shared/interfaces/schema.interface';
import { CommentQueryParams } from '../shared/interfaces/pagination.interface';

/**
 * Create a new comment
 */
export async function createComment(commentData: Partial<IComment>) {
  const session = await Comment.startSession();
  session.startTransaction();

  try {
    // Create the comment
    const comment = new Comment({
      content: commentData.content,
      articleId: new Types.ObjectId(commentData.articleId),
      userId: new Types.ObjectId(commentData.userId),
    });

    // Save the comment
    await comment.save({ session });

    // Update the article's commentIds array
    await Article.findByIdAndUpdate(
      comment.articleId,
      {
        $push: { commentIds: comment._id },
      },
      {
        session,
        new: true,
      },
    );

    await session.commitTransaction();
    return comment;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
}

/**
 * Get comments with optional filtering and pagination
 */
export async function getComments(queryParams: CommentQueryParams = {}) {
  const { page = 1, limit = 10, articleId, userId } = queryParams;
  const skip = (page - 1) * limit;

  const query: any = {};

  if (articleId) {
    query.articleId = new Types.ObjectId(articleId);
  }

  if (userId) {
    query.userId = new Types.ObjectId(userId);
  }

  const [comments, total] = await Promise.all([
    Comment.find(query)
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Comment.countDocuments(query),
  ]);

  return {
    data: comments,
    pagination: {
      total,
      page,
      totalPages: Math.ceil(total / limit),
      limit,
    },
  };
}

/**
 * Get a single comment by ID
 */
export async function getCommentById(id: string) {
  return Comment.findById(id).populate('userId', 'firstName lastName email').lean();
}

/**
 * Update a comment
 */
export async function updateComment(
  id: string,
  updateData: Partial<IComment>,
  userId: string | Types.ObjectId,
) {
  return Comment.findOneAndUpdate(
    { _id: id, userId: new Types.ObjectId(userId) },
    { $set: { content: updateData.content } },
    { new: true, runValidators: true },
  ).populate('userId', 'firstName lastName email');
}

/**
 * Delete a comment
 */
export async function deleteComment(id: string, userId: string | Types.ObjectId, isAdmin = false) {
  const session = await Comment.startSession();
  session.startTransaction();

  try {
    // Find the comment first to get the article ID
    const comment = await Comment.findById(id).session(session);
    if (!comment) {
      throw new Error('Comment not found');
    }

    // Check if user is authorized (either the comment author or an admin)
    if (!isAdmin && !comment.userId.equals(new Types.ObjectId(userId))) {
      throw new Error('Not authorized to delete this comment');
    }

    // Delete the comment
    await Comment.findByIdAndDelete(id).session(session);

    // Remove the comment reference from the article
    await Article.findByIdAndUpdate(
      comment.articleId,
      {
        $pull: { commentIds: comment._id },
      },
      {
        session,
      },
    );

    await session.commitTransaction();
    return { success: true };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
}

export default {
  createComment,
  getComments,
  getCommentById,
  updateComment,
  deleteComment,
};
