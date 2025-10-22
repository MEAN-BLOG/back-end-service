/**
 * @file user.controller.ts
 * @module modules/users/user.controller
 * @description Authentication and user management controller.
 *
 * This module handles:
 * - User registration and login
 * - Profile retrieval
 * - Access token refresh
 * - Logout
 * - Admin-only user management
 */

import { Request, Response } from 'express';
import UserModel from './user.model';
import { generateTokens, refreshAccessToken, verifyRefreshToken } from '../../utils/jwt';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { Types } from 'mongoose';
import { RegisterInput, LoginInput } from './user.validation';
import { UserRole } from '../shared/enums/role.enum';
import * as userService from './user.service';
import { enirementVariables } from '../../config/environment';

/**
 * Register a new user
 * @route POST /api/auth/register
 * @access Public
 *
 * @param req - Express Request containing user registration data
 * @param res - Express Response
 *
 * @example
 * POST /api/auth/register
 * {
 *   "firstName": "John",
 *   "lastName": "Doe",
 *   "email": "john.doe@example.com",
 *   "password": "StrongP@ss123"
 * }
 */
export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { firstName, lastName, email, password }: RegisterInput = req.body;

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'User already exists with this email address',
      });
      return;
    }

    const newUser = new UserModel({
      firstName,
      lastName,
      email,
      password,
      role: UserRole.GUEST,
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'ValidationError' && 'errors' in error) {
      const validationError = error as unknown as { errors: Record<string, { message: string }> };
      const errors: Record<string, string[]> = {};
      for (const key of Object.keys(validationError.errors)) {
        errors[key] = [validationError.errors[key].message];
      }

      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
      return;
    }

    if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
      res.status(409).json({
        success: false,
        message: 'User already exists with this email address',
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error during registration',
    });
  }
}

/**
 * Authenticate a user and issue access and refresh tokens
 * @route POST /api/auth/login
 * @access Public
 *
 * @param req - Express Request with `email` and `password`
 * @param res - Express Response
 */
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password }: LoginInput = req.body;
    const user = await UserModel.findOne({ email }).select('+password');

    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    const tokens = await generateTokens({
      _id: new Types.ObjectId(user._id as string),
      email: user.email,
      role: user.role,
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        ...tokens,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login',
    });
  }
}

/**
 * Retrieve current authenticated user's profile
 * @route GET /api/auth/profile
 * @access Private
 */
export async function getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: { user: req.user },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while retrieving profile',
    });
  }
}

/**
 * Refresh access token using a refresh token
 * @route POST /api/auth/refresh
 * @access Public
 */
export async function refreshToken(req: Request, res: Response): Promise<void> {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      res.status(400).json({ success: false, message: 'Refresh token is required' });
      return;
    }

    const { accessToken, expiresIn } = await refreshAccessToken(token);
    const decoded = await verifyRefreshToken(token);
    const user = await UserModel.findById(decoded.userId).select('-password');

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: { accessToken, refreshToken: token, expiresIn },
    });
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Error refreshing token',
      error: enirementVariables.serverConfig.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

/**
 * Logout the authenticated user (client-side token removal)
 * @route POST /api/auth/logout
 * @access Private
 */
export async function logout(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during logout',
    });
  }
}

/**
 * Retrieve a paginated list of all users (Admin only)
 * @route GET /api/admin/users
 * @access Private (Admin)
 */
export async function getAllUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { page = 1, limit = 10, ...queryParams } = req.query;
    const users = await userService.getAllUsers(
      {
        page: Number(page),
        limit: Math.min(Number(limit), 100),
      },
      queryParams,
    );

    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: users,
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while retrieving users',
    });
  }
}

/**
 * Update a user's role (Admin only)
 * @route PATCH /api/admin/users/:userId
 * @access Private (Admin)
 */
export async function updateUserRole(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    const user = await UserModel.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      data: user,
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while updating user role',
    });
  }
}
