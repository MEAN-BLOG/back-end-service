/**
 * @module utils/paginate
 * @description Utility functions for handling pagination
 */

import {
  PaginatedResponse,
  PaginationOptions,
} from '../modules/shared/interfaces/pagination.interface';

/**
 * Applies pagination to a mongoose query
 * @param query Mongoose query
 * @param options Pagination options
 * @returns Paginated query
 */
export function paginate<T>(
  query: any,
  options: PaginationOptions,
): { query: any; pagination: Omit<PaginatedResponse<T>['pagination'], 'total'> } {
  const { page = 1, limit = 10, sortBy, sortOrder = 'desc' } = options;
  const skip = (page - 1) * limit;

  if (sortBy) {
    const sort: Record<string, 1 | -1> = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    query = query.sort(sort);
  }

  query = query.skip(skip).limit(limit);

  return {
    query,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      totalPages: 0, // Will be set after getting total count
    },
  };
}

/**
 * Creates a paginated response
 * @param data Array of data
 * @param pagination Pagination info
 * @param total Total number of documents
 * @returns Paginated response
 */
export function createPaginatedResponse<T>(
  data: T[],
  pagination: Omit<PaginatedResponse<T>['pagination'], 'total'>,
  total: number,
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / pagination.limit);

  return {
    data,
    pagination: {
      ...pagination,
      total,
      totalPages,
    },
  };
}
