/**
 * @module utils/jwt
 * @description JWT token utilities for authentication
 */

import { enirementVariables } from '../config/environment';
import jwt, { SignOptions } from 'jsonwebtoken';
import { Types } from 'mongoose';
import { ForbiddenError } from './errors';

/**
 * JWT payload interface
 */
export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  type: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}

/**
 * JWT token interface
 */
export interface JWTToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * JWT configuration
 */
const JWT_CONFIG = {
  ACCESS_TOKEN_EXPIRY: 15 * 60,
  REFRESH_TOKEN_EXPIRY: 7 * 24 * 60 * 60,
  ACCESS_TOKEN_SECRET: enirementVariables.tokenConfig.JWT_ACCESS_SECRET,
  REFRESH_TOKEN_SECRET: enirementVariables.tokenConfig.JWT_REFRESH_SECRET,
};

/**
 * Generate JWT tokens for a user
 * @param user - User payload containing id, email, and role
 * @returns Promise<JWTToken> - Access and refresh tokens with expiry
 */
export async function generateTokens(user: {
  _id: Types.ObjectId;
  email: string;
  role: string;
}): Promise<JWTToken> {
  const now = Math.floor(Date.now() / 1000);

  const payload: JWTPayload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
    type: 'access',
    iat: now,
    exp: now + JWT_CONFIG.ACCESS_TOKEN_EXPIRY,
  };

  const refreshPayload: JWTPayload = {
    ...payload,
    type: 'refresh',
    exp: now + JWT_CONFIG.REFRESH_TOKEN_EXPIRY,
  };

  try {
    const signOptions: SignOptions = {
      issuer: 'blog-backend',
      audience: 'blog-users',
    };

    const accessToken = jwt.sign(payload, JWT_CONFIG.ACCESS_TOKEN_SECRET, signOptions);
    const refreshToken = jwt.sign(refreshPayload, JWT_CONFIG.REFRESH_TOKEN_SECRET, signOptions);

    return {
      accessToken,
      refreshToken,
      expiresIn: JWT_CONFIG.ACCESS_TOKEN_EXPIRY * 1000, // Convert seconds to milliseconds
    };
  } catch (error) {
    throw new Error(`Failed to generate tokens: ${error}`);
  }
}

/**
 * Get JWT secret from environment or config
 * @throws Error if secret is not configured
 */
function getJwtSecret(): string {
  const secret = enirementVariables.tokenConfig.JWT_ACCESS_SECRET;
  if (!secret) {
    const error = new Error('JWT access token secret is not configured');
    console.error('JWT Error:', error.message);
    throw error;
  }
  return secret;
}

/**
 * Verify and decode JWT access token
 * @param token - JWT access token
 * @returns Promise<JWTPayload> - Decoded token payload
 * @throws Error if token is invalid or expired
 */
export async function verifyAccessToken(token: string): Promise<JWTPayload> {
  const verifyOptions = {
    issuer: 'blog-backend',
    audience: 'blog-users',
  };

  const secret = getJwtSecret();

  try {
    const decoded = jwt.verify(token, secret, verifyOptions) as JWTPayload;

    if (decoded.type !== 'access') {
      const error = new Error('Invalid token type');
      console.error('Token Error:', error.message, { type: decoded.type });
      throw error;
    }

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new ForbiddenError('Access token expired');
    }
    if (error instanceof Error && error.message === 'jwt expired') {
      throw new ForbiddenError('Access token expired');
    }
    if (error instanceof Error && error.message === 'Invalid token type') {
      throw error;
    }
    if (error instanceof Error && error.message.includes('jwt malformed')) {
      throw new ForbiddenError('Invalid access token: Invalid token format');
    }
    if (error instanceof Error && error.message.includes('invalid signature')) {
      throw new ForbiddenError('Invalid access token: Invalid signature');
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Invalid access token: ${errorMessage}`);
  }
}

/**
 * Verify and decode JWT refresh token
 * @param token - JWT refresh token
 * @returns Promise<JWTPayload> - Decoded token payload
 * @throws Error if token is invalid or expired
 */
export async function verifyRefreshToken(token: string): Promise<JWTPayload> {
  try {
    const verifyOptions = {
      issuer: 'blog-backend',
      audience: 'blog-users',
    };

    const secret = enirementVariables.tokenConfig.JWT_REFRESH_SECRET;
    if (!secret) {
      throw new Error('JWT refresh token secret is not configured');
    }

    const decoded = jwt.verify(token, secret, verifyOptions) as JWTPayload;

    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }
    return decoded;
  } catch (error) {
    if (error instanceof Error && error.message === 'Invalid token type') {
      throw error;
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Refresh token expired');
    }
    if (error instanceof Error && error.message.includes('jwt malformed')) {
      throw new Error('Invalid refresh token: Invalid token format');
    }
    if (error instanceof Error && error.message.includes('invalid signature')) {
      throw new Error('Invalid refresh token: Invalid signature');
    }
    throw new Error('Invalid refresh token');
  }
}

/**
 * Generate a new access token from a refresh token
 * @param refreshToken - Valid refresh token
 * @returns Promise<{accessToken: string, expiresIn: number}> - New access token
 * @throws Error if refresh token is invalid
 */
export async function refreshAccessToken(
  refreshToken: string,
): Promise<{ accessToken: string; expiresIn: number }> {
  const decoded = await verifyRefreshToken(refreshToken);

  const payload: JWTPayload = {
    userId: decoded.userId,
    email: decoded.email,
    role: decoded.role,
    type: 'access',
  };

  try {
    const accessTokenOptions: SignOptions = {
      expiresIn: JWT_CONFIG.ACCESS_TOKEN_EXPIRY,
      issuer: 'blog-backend',
      audience: 'blog-users',
    };

    const accessToken = jwt.sign(payload, JWT_CONFIG.ACCESS_TOKEN_SECRET, accessTokenOptions);

    return {
      accessToken,
      expiresIn: JWT_CONFIG.ACCESS_TOKEN_EXPIRY * 1000, // Convert seconds to milliseconds
    };
  } catch (error) {
    throw new Error(`Failed to refresh access token: ${error}`);
  }
}

/**
 * Extract token from Authorization header
 * @param authHeader - Authorization header value
 * @returns string | null - Extracted token or null if not found
 */
export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7); // Remove 'Bearer ' prefix
}

/**
 * Get JWT configuration (for testing purposes)
 */
export function getJWTConfig() {
  return { ...JWT_CONFIG };
}
