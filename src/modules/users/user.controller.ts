/**
 * @module modules/users/user.controller
 * @description Authentication controller for user registration and login
 */

import { Request, Response } from 'express';
import UserModel from './user.model';
import { generateTokens, refreshAccessToken, verifyRefreshToken } from '../../utils/jwt';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { Types } from 'mongoose';
import { RegisterInput, LoginInput } from './user.validation';
import { UserRole } from '../shared';
import { enirementVariables } from '../../config/environment';

/**
 * User registration controller
 * @route POST /api/auth/register
 * @access Public
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
 * User login controller
 * @route POST /api/auth/login
 * @access Public
 */
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password }: LoginInput = req.body;
    const user = await UserModel.findOne({ email }).select('+password');
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
      return;
    }
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
      return;
    }

    const tokens = await generateTokens({
      _id: new Types.ObjectId(user._id as string),
      email: user.email,
      role: user.role,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _unused, ...userResponse } = user.toObject();

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
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
 * Get current user profile
 * @route GET /api/auth/profile
 * @access Private
 */
export async function getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    const user = await UserModel.findById(req.user.userId).select('-password');
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        user,
      },
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
 * Refresh access token
 * @route POST /api/auth/refresh
 * @access Public (uses refresh token)
 */
export async function refreshToken(req: Request, res: Response): Promise<void> {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      res.status(400).json({
        success: false,
        message: 'Refresh token is required',
      });
      return;
    }

    const { accessToken, expiresIn } = await refreshAccessToken(token);

    const decoded = await verifyRefreshToken(token);

    const user = await UserModel.findById(new Types.ObjectId(decoded.userId)).select('-password');

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken,
        refreshToken: token,
        expiresIn,
      },
    });
  } catch (error: any) {
    if (
      error instanceof Error &&
      (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError')
    ) {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token',
      });
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
 * Logout user (client-side token removal)
 * @route POST /api/auth/logout
 * @access Private
 */
export async function logout(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during logout',
    });
  }
}
