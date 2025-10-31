import { Types } from 'mongoose';
import Reply from './reply.model';
import Comment from '../comments/comment.model';

// Create a new reply
export async function createReply(content: string, userId: string, commentId: string) {
  const reply = new Reply({
    content,
    userId: new Types.ObjectId(userId),
    commentId: new Types.ObjectId(commentId),
  });

  await reply.save();

  // Update comment's reply count
  await Comment.findByIdAndUpdate(commentId, { $push: { replyIds: reply._id } }, { new: true });

  return reply.populate('userId', 'firstName lastName email');
}

// Get replies for a comment
export async function getRepliesByComment(commentId: string) {
  return Reply.find({ commentId: new Types.ObjectId(commentId) })
    .populate('userId', 'firstName lastName email')
    .sort({ createdAt: 1 });
}

// Get a single reply with populated comment and user details
export async function getReplyById(id: string) {
  return Reply.findById(id)
    .populate({
      path: 'commentId',
      select: 'userId content articleId',
      populate: [
        {
          path: 'userId',
          select: 'fullName firstName lastName email',
        },
        {
          path: 'articleId',
          select: 'title content userId image tags createdAt',
          populate: {
            path: 'userId',
            select: 'fullName firstName lastName email',
          },
        },
      ],
    })
    .populate('userId', 'fullName firstName lastName email')
    .lean();
}

// Update a reply
export async function updateReply(id: string, content: string) {
  return Reply.findByIdAndUpdate(id, { content }, { new: true }).populate(
    'userId',
    'firstName lastName email',
  );
}

// Delete a reply
export async function deleteReply(id: string) {
  const reply = await Reply.findByIdAndDelete(id);

  if (reply) {
    // Remove the reply reference from the comment
    await Comment.findByIdAndUpdate(reply.commentId, { $pull: { replyIds: reply._id } });
  }

  return reply;
}

export default {
  createReply,
  getRepliesByComment,
  getReplyById,
  updateReply,
  deleteReply,
};
