/**
 * @module modules/users/user.validation
 * @description Zod validation schemas for user-related operations
 */

import { z } from 'zod';
import { UserRole } from '../shared/enums/role.enum';

/**
 * User registration validation schema
 */
export const registerSchema = z.object({
  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters long')
    .max(50, 'First name cannot exceed 50 characters')
    .trim(),

  lastName: z
    .string()
    .min(2, 'Last name must be at least 2 characters long')
    .max(50, 'Last name cannot exceed 50 characters')
    .trim(),

  email: z.email({ message: 'Please enter a valid email address' }).toLowerCase().trim(),

  password: z
    .string()
    .min(6, 'Password must be at least 6 characters long')
    .max(100, 'Password cannot exceed 100 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one lowercase letter, one uppercase letter, and one number',
    ),
});

/**
 * User login validation schema
 */
export const loginSchema = z.object({
  email: z.email({ message: 'Please enter a valid email address' }).toLowerCase().trim(),

  password: z
    .string()
    .min(1, 'Password is required')
    .max(100, 'Password cannot exceed 100 characters'),
});

/**
 * Password change validation schema
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),

    newPassword: z
      .string()
      .min(6, 'New password must be at least 6 characters long')
      .max(100, 'New password cannot exceed 100 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'New password must contain at least one lowercase letter, one uppercase letter, and one number',
      ),

    confirmPassword: z.string().min(1, 'Password confirmation is required'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

/**
 * User profile update validation schema
 */
export const updateProfileSchema = z.object({
  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters long')
    .max(50, 'First name cannot exceed 50 characters')
    .trim()
    .optional(),

  lastName: z
    .string()
    .min(2, 'Last name must be at least 2 characters long')
    .max(50, 'Last name cannot exceed 50 characters')
    .trim()
    .optional(),

  email: z.email({ message: 'Please enter a valid email address' }).toLowerCase().trim().optional(),
});

/**
 * Role update validation schema (admin only)
 */
export const updateRoleSchema = z.object({
  userId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID format'),

  role: z
    .enum([UserRole.GUEST, UserRole.WRITER, UserRole.EDITOR, UserRole.ADMIN])
    .refine((val) => Object.values(UserRole).includes(val), {
      message: 'Invalid role specified',
    }),
});

/**
 * Type exports for the schemas
 */
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
