/**
 * @module modules/articles/article.controller
 * @description Article controller for handling HTTP requests
 */

import { Request, Response } from 'express';
import { UserRole } from '../shared/enums/role.enum';
import articleService, { ArticleQueryParams } from './article.service';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { IArticle } from '../shared/interfaces/schema.interface';
import mongoose from 'mongoose';

/**
 * Get all articles with optional filtering and pagination
 * @route GET /api/articles
 * @access Public
 */
export async function getArticles(req: Request, res: Response) {
  try {
    const queryParams: ArticleQueryParams = {
      ...req.query,
      page: Number.parseInt(req.query.page as string) || 1,
      limit: Math.min(Number.parseInt(req.query.limit as string) || 10, 100),
    };

    const result = await articleService.getArticles(queryParams);

    res.status(200).json({
      success: true,
      message: 'Articles retrieved successfully',
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error('Error getting articles:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve articles',
    });
  }
}

/**
 * Get a single article by ID
 * @route GET /api/articles/:id
 * @access Public
 */
export async function getArticleById(req: Request, res: Response) {
  try {
    const article = await articleService.getArticleById(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Article retrieved successfully',
      data: article,
    });
  } catch (error) {
    console.error('Error getting article:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve article',
    });
  }
}

/**
 * Create a new article
 * @route POST /api/articles
 * @access Private (Writer, Editor, Admin)
 */
export async function createArticle(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id?.toString();

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }
    if (req.user?.role === UserRole.GUEST) {
      return res.status(403).json({
        success: false,
        message: 'Guests are not allowed to create articles',
      });
    }

    const articleData: Partial<IArticle> = {
      ...req.body,
      userId: new mongoose.Types.ObjectId(userId),
    };

    const article = await articleService.createArticle(articleData, userId);

    res.status(201).json({
      success: true,
      message: 'Article created successfully',
      data: article,
    });
  } catch (error) {
    console.error('Error creating article:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create article',
    });
  }
}

/**
 * Update an existing article
 * @route PUT /api/articles/:id
 * @access Private (Article Owner, Editor, Admin)
 */
export async function updateArticle(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;

    const updateData: Partial<IArticle> = req.body;
    const article = await articleService.updateArticle(id, updateData);
    return res.status(200).json({
      success: true,
      message: 'Article updated successfully',
      data: article,
    });
  } catch (error: any) {
    console.error('Error updating article:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update article',
    });
  }
}

/**
 * Delete an article
 * @route DELETE /api/articles/:id
 * @access Private (Admin only)
 */
export async function deleteArticle(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;

    await articleService.deleteArticle(id);

    res.status(200).json({
      success: true,
      message: 'Article deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting article:', error);

    if (error.message === 'Article not found') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message === 'Only admins can delete articles') {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to delete article',
    });
  }
}

export default {
  getArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
};
