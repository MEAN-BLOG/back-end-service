import { Types } from 'mongoose';
import { UserRole } from '../enums/role.enum';

/**
 * @openapi
 * components:
 *   schemas:
 *     PaginationOptions:
 *       type: object
 *       properties:
 *         page:
 *           type: integer
 *           description: The page number to return (1-based)
 *           minimum: 1
 *           default: 1
 *         limit:
 *           type: integer
 *           description: Number of items per page
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         sortBy:
 *           type: string
 *           description: Field to sort by
 *           default: "createdAt"
 *         sortOrder:
 *           type: string
 *           enum: [asc, desc]
 *           description: Sort order
 *           default: "desc"
 *
 *     PaginationResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             type: object
 *             description: The actual data items
 *         pagination:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *               description: Total number of items
 *             page:
 *               type: integer
 *               description: Current page number
 *             limit:
 *               type: integer
 *               description: Number of items per page
 *             totalPages:
 *               type: integer
 *               description: Total number of pages
 *
 *     UserFilters:
 *       type: object
 *       properties:
 *         role:
 *           $ref: '#/components/schemas/UserRole'
 *         isActive:
 *           type: boolean
 *           description: Filter by active status
 *         email:
 *           type: string
 *           format: email
 *           description: Filter by email (supports partial matches)
 *         name:
 *           type: string
 *           description: Filter by name (supports partial matches)
 *         createdAt:
 *           type: object
 *           properties:
 *             $gte:
 *               type: string
 *               format: date-time
 *               description: Start date range
 *             $lte:
 *               type: string
 *               format: date-time
 *               description: End date range
 *
 *     CommentQueryParams:
 *       type: object
 *       properties:
 *         articleId:
 *           type: string
 *           description: Filter comments by article ID
 *         userId:
 *           type: string
 *           description: Filter comments by user ID
 *         page:
 *           type: integer
 *           description: Page number for pagination
 *           minimum: 1
 *           default: 1
 *         limit:
 *           type: integer
 *           description: Number of items per page
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 */

/**
 * Interface for pagination options
 */
export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Interface for paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Interface for user filters
 */
export interface UserFilters {
  role?: UserRole;
  isActive?: boolean;
  email?: string | RegExp;
  name?: string | RegExp;
  createdAt?: {
    $gte?: Date;
    $lte?: Date;
  };
}

export interface CommentQueryParams {
  articleId?: string;
  userId?: string | Types.ObjectId;
  page?: number;
  limit?: number;
}
