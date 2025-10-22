/**
 * @module utils/filter
 * @description Utility functions for handling query filters
 */

import { UserFilters } from '../modules/shared/interfaces/pagination.interface';
import { UserRole } from '../modules/shared';

/**
 * Builds a filter object for user queries based on query parameters
 * @param query Express request query object
 * @returns Filter object for Mongoose query
 */
function handleRoleFilter(query: Record<string, any>, filters: UserFilters): void {
  if (query.role && Object.values(UserRole).includes(query.role as UserRole)) {
    filters.role = query.role as UserRole;
  }
}

function handleActiveFilter(query: Record<string, any>, filters: UserFilters): void {
  if (query.isActive !== undefined) {
    filters.isActive = query.isActive === 'true';
  }
}

function handleEmailFilter(query: Record<string, any>, filters: UserFilters): void {
  if (query.email) {
    filters.email = new RegExp(query.email, 'i');
  }
}

function handleNameFilter(query: Record<string, any>, filters: UserFilters): void {
  if (query.name) {
    filters.name = new RegExp(query.name, 'i');
  }
}

function handleDateFilter(query: Record<string, any>, filters: UserFilters): void {
  if (query.startDate || query.endDate) {
    filters.createdAt = {};

    if (query.startDate) {
      const startDate = new Date(query.startDate);
      if (!Number.isNaN(startDate.getTime())) {
        filters.createdAt.$gte = startDate;
      }
    }

    if (query.endDate) {
      const endDate = new Date(query.endDate);
      if (!Number.isNaN(endDate.getTime())) {
        // Set to end of day
        endDate.setHours(23, 59, 59, 999);
        filters.createdAt.$lte = endDate;
      }
    }
  }
}

export function buildUserFilters(query: Record<string, any>): UserFilters {
  const filters: UserFilters = {};

  handleRoleFilter(query, filters);
  handleActiveFilter(query, filters);
  handleEmailFilter(query, filters);
  handleNameFilter(query, filters);
  handleDateFilter(query, filters);
  return filters;
}

/**
 * Builds a MongoDB sort object from query parameters
 * @param sortBy Field to sort by
 * @param sortOrder Sort order ('asc' or 'desc')
 * @returns Sort object for Mongoose
 */
export function buildSort(
  sortBy?: string,
  sortOrder: 'asc' | 'desc' = 'desc',
): Record<string, 1 | -1> {
  const sort: Record<string, 1 | -1> = {};

  if (sortBy) {
    const validSortFields = ['createdAt', 'updatedAt', 'email', 'firstName', 'lastName', 'role'];
    if (validSortFields.includes(sortBy)) {
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    }
  } else {
    // Default sort
    sort.createdAt = -1;
  }

  return sort;
}

/**
 * Sanitizes and parses query parameters for pagination
 * @param query Express request query object
 * @returns Sanitized pagination options
 */
export function getPaginationOptions(query: Record<string, any>): { page: number; limit: number } {
  const page = Math.max(1, Number.parseInt(query.page as string, 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(query.limit as string, 10) || 10));

  return { page, limit };
}
