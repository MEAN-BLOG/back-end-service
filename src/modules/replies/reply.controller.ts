import { Request, Response } from 'express';
import { Types } from 'mongoose';
import replyService from './reply.service';
import notificationService from '../notifications/notification.service';
import { IUser, NotificationType } from '../shared';

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
          userId: IUser;
          articleId: { _id: Types.ObjectId; title: string; userId: IUser };
        };
        content: string;
        userId: IUser;
      };

      const replyData = populatedReply as unknown as PopulatedReply;
      const commentAuthorUser = replyData.commentId?.articleId?.userId as IUser;
      const currentUserId = userId.toString();
      console.log(
        'commentAuthorUser',
        commentAuthorUser,
        'currentUserId',
        currentUserId?.toString(),
      );
      if (commentAuthorUser?._id?.toString() !== currentUserId) {
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
          userId: new Types.ObjectId(commentAuthorUser?._id?.toString()),
          type: NotificationType.REPLY,
          message: `New reply to your comment on ${articleTitle}: "${commentPreview}"`,
          referenceId: reply.commentId,
          referenceModel: 'Reply',
          metadata: {
            articleId: replyData.commentId?.articleId?._id,
            articleTitle: articleTitle,
            commentAuthor: replyData.userId?.firstName,
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
    success: replies.length > 0,
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
  if (!Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Invalid reply ID format' });
  }
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
