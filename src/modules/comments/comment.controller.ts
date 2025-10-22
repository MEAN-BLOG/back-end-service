/**
 * @module modules/comments/comment.controller
 * @description Comment controller for handling HTTP requests
 */

import { Request, Response } from 'express';
import { Types } from 'mongoose';
import commentService from './comment.service';
import notificationService from '../notifications/notification.service';
import { UpdateCommentInput } from './comment.validation';
import { IComment } from '../shared';
import { NotificationType } from '../../shared/types/notification.types';

interface AuthenticatedRequest extends Request {
  user?: {
    _id: Types.ObjectId;
    role: string;
  };
}

/**
 * Create a new comment
 */
export async function createComment(req: AuthenticatedRequest, res: Response) {
  try {
    const { articleId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const commentData: Partial<IComment> = {
      ...req.body,
      articleId,
    };

    // Create the comment
    const comment = await commentService.createComment({
      ...commentData,
      articleId: new Types.ObjectId(commentData.articleId),
      userId: new Types.ObjectId(userId),
      content: commentData.content,
    });

    try {
      // Get the populated comment with article and user details
      const populatedComment = await commentService.getCommentById(comment.id);

      if (!populatedComment) {
        console.warn('Comment not found after creation:', comment._id);
        return;
      }

      // Type assertion for the populated document
      type PopulatedComment = {
        articleId: {
          _id: Types.ObjectId;
          title: string;
          author: Types.ObjectId | { _id: Types.ObjectId; username: string };
        };
        content: string;
        userId: { _id: Types.ObjectId; username: string };
      };

      const commentData = populatedComment as unknown as PopulatedComment;

      // Extract author ID whether it's populated or just an ObjectId
      const authorId =
        commentData.articleId.author instanceof Types.ObjectId
          ? commentData.articleId.author
          : commentData.articleId.author._id;

      const currentUserId = userId.toString();
      const authorIdStr = authorId.toString();

      // Send notification to the article author (if not the same as commenter)
      if (authorIdStr !== currentUserId) {
        const articleTitle = commentData.articleId.title || 'your article';
        const commentPreview =
          commentData.content.length > 50
            ? `${commentData.content.substring(0, 50)}...`
            : commentData.content;

        await notificationService.createAndEmitNotification({
          userId: authorId,
          type: NotificationType.NEW_COMMENT,
          message: `New comment on ${articleTitle}: ${commentPreview}`,
          referenceId: comment?.id,
          referenceModel: 'Comment',
          metadata: {
            articleId: commentData.articleId._id,
            articleTitle: commentData.articleId.title,
            commentAuthor: commentData.userId.username,
          },
        });
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      // Don't fail the request if notification fails
    }

    res.status(201).json({
      success: true,
      message: 'Comment created successfully',
      data: comment,
    });
  } catch (error: any) {
    console.error('Error creating comment:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create comment',
    });
  }
}

/**
 * Get comments with optional filtering and pagination
 */
export async function getComments(req: Request, res: Response) {
  try {
    const { articleId } = req.params;
    const { page = '1', limit = '10', userId } = req.query;

    const result = await commentService.getComments({
      articleId,
      userId: userId as string | undefined,
      page: Number.parseInt(page as string, 10),
      limit: Math.min(Number.parseInt(limit as string, 10), 100),
    });

    res.status(200).json({
      success: true,
      message: 'Comments retrieved successfully',
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error: any) {
    console.error('Error getting comments:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve comments',
    });
  }
}

/**
 * Get a single comment by ID
 */
export async function getCommentById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const comment = await commentService.getCommentById(id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Comment retrieved successfully',
      data: comment,
    });
  } catch (error: any) {
    console.error('Error getting comment:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve comment',
    });
  }
}

/**
 * Update a comment
 */
export async function updateComment(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const updateData: UpdateCommentInput = req.body;
    const updatedComment = await commentService.updateComment(
      id,
      updateData,
      new Types.ObjectId(userId),
    );

    if (!updatedComment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found or not authorized',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Comment updated successfully',
      data: updatedComment,
    });
  } catch (error: any) {
    console.error('Error updating comment:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update comment',
    });
  }
}

/**
 * Delete a comment
 */
export async function deleteComment(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user?._id;
    const isAdmin = req.user?.role === 'admin';

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const result = await commentService.deleteComment(id, new Types.ObjectId(userId), isAdmin);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found or not authorized',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting comment:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete comment',
    });
  }
}

export default {
  createComment,
  getComments,
  getCommentById,
  updateComment,
  deleteComment,
};
