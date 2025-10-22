/**
 * @module modules/users/user.service
 * @description Service layer for user-related operations
 */

import { FilterQuery, Types } from 'mongoose';
import { UserRole } from '../shared/enums/role.enum';
import { IUser } from '../shared';
import userSchema from './user.model';
import { PaginationOptions } from '../shared/interfaces/pagination.interface';

/**
 * Interface for user query parameters
 */
interface UserQueryParams {
  role?: UserRole;
  email?: string;
  search?: string;
  startDate?: Date;
  endDate?: Date;
}

/**
 * Get all users with pagination and filtering
 * @param queryParams Query parameters for filtering and pagination
 * @param paginationOptions Pagination options (page, limit)
 * @returns Paginated list of users
 */
export async function getAllUsers(
  paginationOptions: PaginationOptions,
  queryParams: UserQueryParams = {},
) {
  const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = paginationOptions;
  const { role, email, search, startDate, endDate } = queryParams;

  const filter: FilterQuery<IUser> = {};

  if (role) {
    filter.role = role;
  }

  if (email) {
    filter.email = { $regex: email, $options: 'i' };
  }

  if (search) {
    filter.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) {
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = endOfDay;
    }
  }

  const [users, total] = await Promise.all([
    userSchema
      .find(filter)
      .select('-password -refreshToken')
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    userSchema.countDocuments(filter),
  ]);

  return {
    data: users,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Update a user's role
 * @param userId ID of the user to update
 * @param newRole New role to assign
 * @param currentUserRole Role of the current user making the request
 * @returns Updated user or null if not found
 */
export async function updateUserRole(
  userId: string | Types.ObjectId,
  newRole: UserRole,
  currentUserRole: UserRole,
) {
  const roleHierarchy = {
    [UserRole.GUEST]: 0,
    [UserRole.WRITER]: 1,
    [UserRole.EDITOR]: 2,
    [UserRole.ADMIN]: 3,
  };

  if (currentUserRole !== UserRole.ADMIN) {
    throw new Error('Unauthorized: Only admins can update user roles');
  }

  const user = await userSchema.findById(userId);
  if (!user) {
    return null;
  }

  if (roleHierarchy[newRole] <= roleHierarchy[user.role]) {
    throw new Error('Cannot assign a role that is not higher than the current role');
  }

  user.role = newRole;
  await user.save();

  return user;
}

/**
 * Find a user by ID
 * @param userId ID of the user to find
 * @returns User document or null if not found
 */
export async function findUserById(userId: string | Types.ObjectId) {
  return userSchema.findById(userId).select('-password -refreshToken');
}

export default {
  getAllUsers,
  updateUserRole,
  findUserById,
};
