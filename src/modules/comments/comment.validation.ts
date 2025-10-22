import { z } from 'zod';

/**
 * Base validation for comment content
 */
const commentContentSchema = z
  .string()
  .min(1, 'Comment cannot be empty')
  .max(1000, 'Comment cannot exceed 1000 characters')
  .trim();

/**
 * Schema for creating a new comment
 */
export const createCommentSchema = z.object({
  content: commentContentSchema,
});

/**
 * Schema for updating a comment
 */
export const updateCommentSchema = z.object({
  content: commentContentSchema,
});

/**
 * Type exports for the schemas
 */
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
