import { Request, Response } from 'express';
import { Types } from 'mongoose';
import replyService from './reply.service';
import notificationService from '../notifications/notification.service';
import { NotificationType } from '../../shared/types/notification.types';

interface AuthenticatedRequest extends Request {
  user?: {
    _id: Types.ObjectId;
    role: string;
  };
}

/**
 * Create a new reply to a comment
 * @param req - The request object send by the client
 * @param res - The response object send by the server
 * @returns Promise<void>
 */
export async function createReply(req: AuthenticatedRequest, res: Response) {
  try {
    const { content } = req.body;
    const { commentId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    // Create the reply
    const reply = await replyService.createReply(content, userId.toString(), commentId);

    try {
      // Get the populated reply with comment and user details
      const replyId = reply.id;
      const populatedReply = await replyService.getReplyById(replyId);

      if (!populatedReply) {
        console.warn('Reply not found after creation:', reply._id);
        return;
      }

      // Type assertion for the populated document
      type PopulatedReply = {
        commentId: {
          _id: Types.ObjectId;
          content: string;
          user: Types.ObjectId | { _id: Types.ObjectId; username: string };
          articleId: { _id: Types.ObjectId; title: string } | Types.ObjectId;
        };
        content: string;
        userId: { _id: Types.ObjectId; username: string };
      };

      const replyData = populatedReply as unknown as PopulatedReply;

      // Extract comment author ID whether it's populated or just an ObjectId
      const commentAuthorId =
        replyData.commentId.user instanceof Types.ObjectId
          ? replyData.commentId.user.toString()
          : replyData.commentId.user._id.toString();

      const currentUserId = userId.toString();

      // Send notification to the comment author (if not the same as replier)
      if (commentAuthorId !== currentUserId) {
        const commentPreview =
          replyData.commentId.content.length > 30
            ? `${replyData.commentId.content.substring(0, 30)}...`
            : replyData.commentId.content;

        const articleId =
          replyData.commentId.articleId instanceof Types.ObjectId
            ? replyData.commentId.articleId.toString()
            : replyData.commentId.articleId._id.toString();

        const articleTitle =
          replyData.commentId.articleId instanceof Types.ObjectId
            ? 'an article'
            : replyData.commentId.articleId.title || 'an article';

        await notificationService.createAndEmitNotification({
          userId: new Types.ObjectId(commentAuthorId),
          type: NotificationType.NEW_REPLY,
          message: `New reply to your comment on ${articleTitle}: "${commentPreview}"`,
          referenceId: reply.id,
          referenceModel: 'Reply',
          metadata: {
            commentId: replyData.commentId._id,
            articleId: articleId,
            articleTitle: typeof articleTitle === 'string' ? articleTitle : 'an article',
            replyAuthor: replyData.userId.username,
          },
        });
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error sending notification:', error.message);
      } else {
        console.error('An unknown error occurred while sending notification');
      }
    }

    res.status(201).json({
      success: true,
      data: reply,
    });
  } catch (error: any) {
    console.error('Error creating reply:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating reply',
      error: error.message,
    });
  }
}

/**
 * Get replies for a comment
 * @param req - The request object send by the client
 * @param res - The response object send by the server
 * @returns Promise<void>
 */
export async function getRepliesByComment(req: Request, res: Response) {
  const { commentId } = req.params;
  const replies = await replyService.getRepliesByComment(commentId);

  res.status(200).json({
    success: true,
    data: replies,
  });
}

/**
 * Get a single reply
 * @param req - The request object send by the client
 * @param res - The response object send by the server
 * @returns Promise<void>
 */
export async function getReply(req: Request, res: Response) {
  const { id } = req.params;
  const reply = await replyService.getReplyById(id);

  if (!reply) {
    return res.status(404).json({
      success: false,
      message: 'Reply not found',
    });
  }

  res.status(200).json({
    success: true,
    data: reply,
  });
}

/**
 * Update a reply
 * @param req - The request object send by the client
 * @param res - The response object send by the server
 * @returns Promise<void>
 */
export async function updateReply(req: Request, res: Response) {
  const { id } = req.params;
  const { content } = req.body;

  const updatedReply = await replyService.updateReply(id, content);

  if (!updatedReply) {
    return res.status(404).json({
      success: false,
      message: 'Reply not found',
    });
  }

  res.status(200).json({
    success: true,
    data: updatedReply,
  });
}

/**
 * Delete a reply
 * @param req - The request object send by the client
 * @param res - The response object send by the server
 * @returns Promise<void>
 */
export async function deleteReply(req: Request, res: Response) {
  const { id } = req.params;
  const deletedReply = await replyService.deleteReply(id);

  if (!deletedReply) {
    return res.status(404).json({
      success: false,
      message: 'Reply not found',
    });
  }

  res.status(200).json({
    success: true,
    data: deletedReply,
  });
}

export default {
  createReply,
  getRepliesByComment,
  getReply,
  updateReply,
  deleteReply,
};
