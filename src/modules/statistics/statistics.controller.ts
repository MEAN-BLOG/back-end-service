/**
 * @module modules/statistics/statistics.controller
 * @description Controller for all blog statistics
 */

import { Request, Response } from 'express';
import statisticsService from './statistics.service';

const handleResponse = (res: Response, message: string, data: any) => {
  return res.status(200).json({
    success: true,
    message,
    data,
  });
};

const handleError = (res: Response, error: any) => {
  console.error('[StatisticsController Error]', error);
  return res.status(500).json({
    success: false,
    message: error?.message || 'Internal Server Error',
  });
};

// --- Overview ---
export const getOverview = async (req: Request, res: Response) => {
  try {
    const data = await statisticsService.getOverview();
    return handleResponse(res, 'Overview statistics fetched successfully', data);
  } catch (error) {
    return handleError(res, error);
  }
};

// --- Articles ---
export const getArticlesPerMonth = async (req: Request, res: Response) => {
  try {
    const data = await statisticsService.getArticlesPerMonth();
    return handleResponse(res, 'Articles per month fetched successfully', data);
  } catch (error) {
    return handleError(res, error);
  }
};

export const getAverageArticlesPerAuthor = async (req: Request, res: Response) => {
  try {
    const data = await statisticsService.getAverageArticlesPerAuthor();
    return handleResponse(res, 'Average articles per author fetched successfully', data);
  } catch (error) {
    return handleError(res, error);
  }
};

export const getTopViewedArticles = async (req: Request, res: Response) => {
  try {
    const data = await statisticsService.getTopViewedArticles();
    return handleResponse(res, 'Top viewed articles fetched successfully', data);
  } catch (error) {
    return handleError(res, error);
  }
};

export const getMostCommentedArticles = async (req: Request, res: Response) => {
  try {
    const data = await statisticsService.getMostCommentedArticles();
    return handleResponse(res, 'Most commented articles fetched successfully', data);
  } catch (error) {
    return handleError(res, error);
  }
};

// --- Tags ---
export const getTopTags = async (req: Request, res: Response) => {
  try {
    const data = await statisticsService.getTopTags();
    return handleResponse(res, 'Top tags fetched successfully', data);
  } catch (error) {
    return handleError(res, error);
  }
};

// --- Authors ---
export const getTopAuthors = async (req: Request, res: Response) => {
  try {
    const data = await statisticsService.getTopAuthors();
    return handleResponse(res, 'Top authors fetched successfully', data);
  } catch (error) {
    return handleError(res, error);
  }
};

export const getAuthorFrequency = async (req: Request, res: Response) => {
  try {
    const data = await statisticsService.getAuthorFrequency();
    return handleResponse(res, 'Author publish frequency fetched successfully', data);
  } catch (error) {
    return handleError(res, error);
  }
};

export const getAuthorTrends = async (req: Request, res: Response) => {
  try {
    const data = await statisticsService.getAuthorTrends();
    return handleResponse(res, 'Author trends fetched successfully', data);
  } catch (error) {
    return handleError(res, error);
  }
};

export default {
  getOverview,
  getArticlesPerMonth,
  getAverageArticlesPerAuthor,
  getTopViewedArticles,
  getMostCommentedArticles,
  getTopTags,
  getTopAuthors,
  getAuthorFrequency,
  getAuthorTrends,
};
