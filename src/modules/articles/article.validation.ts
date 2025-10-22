import { z } from 'zod';

/**
 * Common validation for both create and update
 */
export const articleBaseSchema = {
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters long')
    .max(200, 'Title cannot exceed 200 characters')
    .trim(),

  content: z
    .string()
    .min(50, 'Content must be at least 50 characters long')
    .max(20000, 'Content cannot exceed 20000 characters'),

  image: z.url('Image must be a valid URL').optional(),

  tags: z.array(z.string()).max(10, 'Cannot have more than 10 tags').optional(),
};

/**
 * Schema for creating a new article
 */
export const createArticleSchema = z.object({
  title: articleBaseSchema.title,
  content: articleBaseSchema.content,
  image: articleBaseSchema.image,
  tags: articleBaseSchema.tags,
});

/**
 * Schema for updating an article
 */
export const updateArticleSchema = z.object({
  title: articleBaseSchema.title.optional(),
  content: articleBaseSchema.content.optional(),
  image: articleBaseSchema.image,
  tags: articleBaseSchema.tags,
});

/**
 * Type exports for the schemas
 */
export type CreateArticleInput = z.infer<typeof createArticleSchema>;
export type UpdateArticleInput = z.infer<typeof updateArticleSchema>;
