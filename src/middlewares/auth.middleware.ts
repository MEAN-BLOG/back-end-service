/**
 * @file auth.middleware.ts
 * @description Express middleware for handling authentication and role-based authorization.
 *
 * This module provides:
 * - `authenticate`: Verifies JWT access tokens and attaches the authenticated user to the request.
 * - `authorize`: Restricts access to routes based on user roles.
 */

import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, extractTokenFromHeader } from '../utils/jwt';
import UserModel from '../modules/users/user.model';
import { defineAbilitiesFor } from '../abilities/abilities';
import { IUser, UserRole } from '../modules/shared';

/**
 * Extended Express Request object that includes the authenticated user
 * and their ability configuration (from CASL).
 */
export interface AuthenticatedRequest extends Request {
  user?: IUser;
  ability?: any;
}

/**
 * Middleware that authenticates users via a JWT access token.
 *
 * - Extracts the token from the `Authorization` header.
 * - Verifies its validity using `verifyAccessToken`.
 * - Loads the corresponding user from MongoDB.
 * - Attaches the user and their CASL ability rules to `req`.
 *
 * If authentication fails, it responds with `401 Unauthorized`.
 *
 * @param req - Express request, extended with `user` and `ability`.
 * @param res - Express response object.
 * @param next - Express next middleware function.
 *
 * @returns `void`
 *
 * @example
 * ```ts
 * import { authenticate } from '../middlewares/auth.middleware';
 *
 * router.get('/profile', authenticate, (req, res) => {
 *   res.json({ success: true, user: req.user });
 * });
 * ```
 */
export async function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access token is required',
      });
      return;
    }

    const decoded = await verifyAccessToken(token);
    if (!decoded?.userId) {
      res.status(404).json({
        success: false,
        message: 'Invalid access token',
      });
      return;
    }

    const user = await UserModel.findById(decoded.userId).select('-password').exec();
    if (!user?._id) {
      res.status(401).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    req.user = user.toObject ? user.toObject() : (user as IUser);
    req.ability = defineAbilitiesFor(req.user);

    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({
        success: false,
        message: 'Token expired',
      });
    } else if (error.name === 'JsonWebTokenError') {
      res.status(401).json({
        success: false,
        message: 'Invalid access token',
      });
    } else {
      console.error('[AUTH MIDDLEWARE ERROR]', error);
      next(error);
    }
  }
}

/**
 * Middleware that restricts access based on user roles.
 *
 * Checks whether the authenticated user’s role is **equal to or higher**
 * than the required role according to the defined role hierarchy.
 *
 * @param requiredRole - The minimum role required to access the route.
 * @returns Express middleware that authorizes or denies access.
 *
 * @example
 * ```ts
 * import { authenticate, authorize } from '../middlewares/auth.middleware';
 * import { UserRole } from '../modules/shared/enums/role.enum';
 *
 * router.delete(
 *   '/admin/users/:id',
 *   authenticate,
 *   authorize(UserRole.ADMIN),
 *   adminController.deleteUser,
 * );
 * ```
 */
export function authorize(requiredRole: UserRole) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const userRole = req.user.role;
    const roleHierarchy = {
      [UserRole.ADMIN]: 3,
      [UserRole.EDITOR]: 2,
      [UserRole.WRITER]: 1,
      [UserRole.GUEST]: 0,
    };

    if (roleHierarchy[userRole] < roleHierarchy[requiredRole]) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      });
    }

    next();
  };
}
