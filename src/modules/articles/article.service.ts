/**
 * @module modules/articles/article.service
 * @description Article service for handling business logic
 */

import Article from './article.model';
import { IArticle } from '../shared/interfaces/schema.interface';
import { FilterQuery, Types } from 'mongoose';

export interface ArticleQueryParams {
  author?: string;
  tag?: string;
  status?: 'draft' | 'published';
  search?: string;
  page?: number;
  limit?: number;
}

/**
 * Get all articles with optional filtering and pagination
 */
export async function getArticles(queryParams: ArticleQueryParams = {}, userId?: string) {
  const { page = 1, limit = 10, ...filters } = queryParams;
  const skip = (page - 1) * limit;

  const query: FilterQuery<IArticle> = {};

  if (filters.author) {
    query.author = new Types.ObjectId(filters.author);
  }

  if (filters.tag) {
    query.tags = filters.tag;
  }

  if (filters.search) {
    query.$or = [
      { title: { $regex: filters.search, $options: 'i' } },
      { content: { $regex: filters.search, $options: 'i' } },
    ];
  }
  if (userId) {
    query.userId = new Types.ObjectId(userId);
  }
  const [articles, total] = await Promise.all([
    Article.find(query)
      .populate('author', 'username email firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Article.countDocuments(query),
  ]);

  return {
    data: articles,
    pagination: {
      total,
      page,
      totalPages: Math.ceil(total / limit),
      limit,
    },
  };
}

/**
 * Get a single article by ID
 */
export async function getArticleById(id: string) {
  return Article.findById(id)
    .populate('author', 'fullName firstName lastName email')
    .populate({
      path: 'commentIds',
      select: 'content userId createdAt updatedAt',
      populate: {
        path: 'userId',
        select: 'firstName lastName email fullName',
      },
    })
    .lean();
}

/**
 * Create a new article
 */
export async function createArticle(articleData: Partial<IArticle>, userId: string) {
  const article = new Article({
    ...articleData,
    author: userId,
  });

  return article.save();
}

/**
 * Update an existing article
 */
export async function updateArticle(id: string, updateData: Partial<IArticle>) {
  return await Article.findByIdAndUpdate(
    id,
    {
      ...updateData,
    },
    { new: true },
  );
}

/**
 * Delete an article
 */
export async function deleteArticle(id: string) {
  return await Article.findByIdAndDelete(id);
}

export default {
  getArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
};
