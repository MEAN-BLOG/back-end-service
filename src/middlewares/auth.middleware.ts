/**
 * @module middlewares/auth.middleware
 * @description JWT authentication and authorization middleware
 */

import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, extractTokenFromHeader, JWTPayload } from '../utils/jwt';
import UserModel from '../modules/users/user.model';

/**
 * Extended Request interface with user information
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

/**
 * JWT authentication middleware
 * Verifies access token and attaches user info to request
 */
export async function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required',
      });
    }

    const decoded: JWTPayload = await verifyAccessToken(token);

    const user = await UserModel.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('expired')) {
        return res.status(401).json({
          success: false,
          message: 'Access token expired',
        });
      }

      if (error.message.includes('Invalid')) {
        return res.status(401).json({
          success: false,
          message: 'Invalid access token',
        });
      }
    }

    return res.status(401).json({
      success: false,
      message: 'Authentication failed',
    });
  }
}

/**
 * Role-based authorization middleware factory
 * @param allowedRoles - Array of roles allowed to access the endpoint
 */
export function authorize(allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      });
    }

    next();
  };
}

/**
 * Optional authentication middleware
 * Attaches user info if token is present, but doesn't fail if absent
 */
export async function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (token) {
      const decoded: JWTPayload = await verifyAccessToken(token);

      const user = await UserModel.findById(decoded.userId).select('-password');
      if (user) {
        req.user = {
          userId: decoded.userId,
          email: decoded.email,
          role: decoded.role,
        };
      }
    }

    next();
  } catch (error) {
    console.error('error at file src/middlewares/auth.middleware.ts', error);
    next();
  }
}

/**
 * Admin-only authorization middleware
 */
export const requireAdmin = authorize(['admin']);

/**
 * Editor and Admin authorization middleware
 */
export const requireEditorOrAdmin = authorize(['editor', 'admin']);

/**
 * Writer, Editor, and Admin authorization middleware
 */
export const requireWriterOrAbove = authorize(['writer', 'editor', 'admin']);

/**
 * Any authenticated user authorization middleware
 */
export const requireAuth = authenticate;
