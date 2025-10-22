import { Request, Response } from 'express';
import replyService from './reply.service';

/**
 * Create a new reply to a comment
 * @param req - The request object send by the client
 * @param res - The response object send by the server
 * @returns Promise<void>
 */
export async function createReply(req: Request, res: Response) {
  const { content, userId } = req.body;
  const { commentId } = req.params;

  const reply = await replyService.createReply(content, userId, commentId);

  res.status(201).json({
    success: true,
    data: reply,
  });
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
