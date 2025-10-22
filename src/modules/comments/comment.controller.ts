/**
 * @module modules/comments/comment.controller
 * @description Comment controller for handling HTTP requests
 */

import { Request, Response } from 'express';
import { Types } from 'mongoose';
import commentService from './comment.service';
import { UpdateCommentInput } from './comment.validation';
import { IComment } from '../shared';

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

    const comment = await commentService.createComment({
      ...commentData,
      articleId: new Types.ObjectId(commentData.articleId),
      userId: new Types.ObjectId(userId),
      content: commentData.content,
    });

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
