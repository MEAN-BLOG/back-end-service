import { z } from 'zod';
import { Types } from 'mongoose';

// Helper function to validate MongoDB ObjectId
const isValidObjectId = (value: string): boolean => {
  return Types.ObjectId.isValid(value);
};

/**
 * Base validation for reply content
 */
const replyContentSchema = z
  .string()
  .min(1, 'Reply cannot be empty')
  .max(500, 'Reply cannot exceed 500 characters')
  .trim();

/**
 * Schema for creating a new reply
 */
export const createReplySchema = z.object({
  content: replyContentSchema,
});

/**
 * Schema for updating a reply
 */
export const updateReplySchema = z.object({
  content: replyContentSchema,
});

/**
 * Schema for reply ID validation
 */
export const replyIdSchema = z
  .string()
  .refine((value) => isValidObjectId(value), { message: 'Invalid reply ID format' });

/**
 * Schema for comment ID validation
 */
export const commentIdSchema = z
  .string()
  .refine((value) => isValidObjectId(value), { message: 'Invalid comment ID format' });

/**
 * Type exports for the schemas
 */
export type CreateReplyInput = z.infer<typeof createReplySchema>;
export type UpdateReplyInput = z.infer<typeof updateReplySchema>;
