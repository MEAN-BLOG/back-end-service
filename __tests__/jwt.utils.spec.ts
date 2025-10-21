/**
 * @file jwt.utils.test.ts
 * @jest-environment node
 * @description
 * Comprehensive test suite for JWT utility functions used in authentication.
 * This file tests token generation, verification, refresh logic, and token extraction
 * ensuring correct behavior for access/refresh tokens and robust error handling.
 */

import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import {
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
  refreshAccessToken,
  extractTokenFromHeader,
} from '../src/utils/jwt';
import { enirementVariables } from '../src/config/environment';
/** @constant originalEnv Backup of original environment variables */
const originalEnv = { ...process.env };

/**
 * @description Mock implementation of jsonwebtoken to simulate token creation and validation.
 * Returns properly formatted JWT-like strings for access and refresh tokens.
 */
jest.mock('jsonwebtoken', () => ({
  ...jest.requireActual('jsonwebtoken'),
  sign: jest.fn((payload) => {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
    const payloadStr = Buffer.from(
      JSON.stringify({
        ...payload,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (payload.type === 'access' ? 3600 : 86400),
      }),
    ).toString('base64');
    return `${header}.${payloadStr}.signature`;
  }),
  verify: jest.fn((token) => {
    if (token.includes('valid-access')) {
      return {
        userId: 'test-user-id',
        email: 'test@example.com',
        role: 'user',
        type: 'access',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };
    }
    if (token.includes('valid-refresh')) {
      return {
        userId: 'test-user-id',
        email: 'test@example.com',
        role: 'user',
        type: 'refresh',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 86400,
      };
    }
    throw new Error('Invalid token');
  }),
}));

/** @setup Initialize environment variables before running tests */
beforeAll(() => {
  enirementVariables.tokenConfig.JWT_ACCESS_SECRET = 'test-access-secret';
  enirementVariables.tokenConfig.JWT_REFRESH_SECRET = 'test-refresh-secret';
  enirementVariables.tokenConfig.JWT_ACCESS_EXPIRY = '15m';
  enirementVariables.tokenConfig.JWT_REFRESH_EXPIRY = '7d';
});

/** @cleanup Restore original environment and mocks */
afterAll(() => {
  process.env = originalEnv;
  jest.restoreAllMocks();
});

/** @beforeEach Clear mocks before each test case */
beforeEach(() => {
  jest.clearAllMocks();
});

describe('JWT Utilities', () => {
  const mockUser = {
    _id: new Types.ObjectId(),
    email: 'test@example.com',
    role: 'guest',
  };

  /**
   * @group generateTokens
   * @description Tests for token creation including payload and expiry logic.
   */
  describe('generateTokens', () => {
    /**
     * @test
     * @description Should generate both access and refresh tokens with correct expiry.
     */
    it('should generate access and refresh tokens successfully', async () => {
      const result = await generateTokens(mockUser);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('expiresIn');
      expect(result.expiresIn).toBe(15 * 60 * 1000);
    });

    /**
     * @test
     * @description Should create valid JWT payload structure for both tokens.
     */
    it('should generate valid JWT tokens', async () => {
      const result = await generateTokens(mockUser);

      const decodeMockJwt = (token: string) => {
        const [, payload] = token.split('.');
        return JSON.parse(Buffer.from(payload, 'base64').toString());
      };

      const decodedAccess = decodeMockJwt(result.accessToken);
      expect(decodedAccess).toMatchObject({
        userId: mockUser._id.toString(),
        email: mockUser.email,
        role: mockUser.role,
        type: 'access',
      });

      const decodedRefresh = decodeMockJwt(result.refreshToken);
      expect(decodedRefresh.type).toBe('refresh');
    });
  });

  /**
   * @group verifyAccessToken
   * @description Tests for access token validation, structure, and error handling.
   */
  describe('verifyAccessToken', () => {
    /**
     * @test
     * @description Should correctly verify a valid access token.
     */
    it('should verify valid access token', async () => {
      const mockToken = 'valid-access-token';
      const mockDecoded = {
        userId: 'test-user-id',
        email: 'test@example.com',
        role: 'user',
        type: 'access',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      (jwt.verify as jest.Mock).mockImplementationOnce(() => mockDecoded);

      const decoded = await verifyAccessToken(mockToken);
      expect(decoded).toEqual(mockDecoded);
      expect(jwt.verify).toHaveBeenCalledWith(
        mockToken,
        enirementVariables.tokenConfig.JWT_ACCESS_SECRET,
        {
          issuer: 'blog-backend',
          audience: 'blog-users',
        },
      );
    });

    /**
     * @test
     * @description Should throw when access token is invalid.
     */
    it('should throw error for invalid token', async () => {
      (jwt.verify as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Invalid token');
      });

      await expect(verifyAccessToken('invalid-token')).rejects.toThrow(
        'Invalid access token: Invalid token',
      );
    });

    /**
     * @test
     * @description Should reject if token type is refresh instead of access.
     */
    it('should throw error for refresh token used as access token', async () => {
      (jwt.verify as jest.Mock).mockImplementationOnce(() => ({
        userId: 'test-user-id',
        email: 'test@example.com',
        role: 'user',
        type: 'refresh',
      }));

      await expect(verifyAccessToken('refresh-token')).rejects.toThrow('Invalid token type');
    });

    /**
     * @test
     * @description Should handle expired tokens gracefully.
     */
    it('should throw error for expired token', async () => {
      (jwt.verify as jest.Mock).mockImplementationOnce(() => {
        const error = new Error('jwt expired') as any;
        error.name = 'TokenExpiredError';
        throw error;
      });

      await expect(verifyAccessToken('expired-token')).rejects.toThrow('Access token expired');
    });
  });

  /**
   * @group verifyRefreshToken
   * @description Tests for refresh token validation and type enforcement.
   */
  describe('verifyRefreshToken', () => {
    /**
     * @test
     * @description Should verify valid refresh token successfully.
     */
    it('should verify valid refresh token', async () => {
      const mockToken = 'valid-refresh-token';
      const mockDecoded = {
        userId: 'test-user-id',
        email: 'test@example.com',
        role: 'user',
        type: 'refresh',
      };

      (jwt.verify as jest.Mock).mockImplementationOnce(() => mockDecoded);

      const decoded = await verifyRefreshToken(mockToken);
      expect(decoded).toEqual(mockDecoded);
      expect(jwt.verify).toHaveBeenCalledWith(
        mockToken,
        enirementVariables.tokenConfig.JWT_REFRESH_SECRET,
        {
          issuer: 'blog-backend',
          audience: 'blog-users',
        },
      );
    });

    /**
     * @test
     * @description Should throw when refresh token is invalid.
     */
    it('should throw error for invalid refresh token', async () => {
      (jwt.verify as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Invalid token');
      });

      await expect(verifyRefreshToken('invalid-token')).rejects.toThrow('Invalid refresh token');
    });

    /**
     * @test
     * @description Should reject access token used as refresh token.
     */
    it('should throw error for access token used as refresh token', async () => {
      (jwt.verify as jest.Mock).mockImplementationOnce(() => ({
        type: 'access',
      }));

      await expect(verifyRefreshToken('access-token')).rejects.toThrow('Invalid token type');
    });
  });

  /**
   * @group refreshAccessToken
   * @description Tests for generating new access tokens using valid refresh tokens.
   */
  describe('refreshAccessToken', () => {
    /**
     * @test
     * @description Should refresh access token correctly when refresh token is valid.
     */
    it('should refresh an access token with a valid refresh token', async () => {
      (jwt.verify as jest.Mock).mockImplementationOnce(() => ({
        userId: mockUser._id.toString(),
        email: mockUser.email,
        role: mockUser.role,
        type: 'refresh',
      }));

      const newAccessToken = 'new-access-token';
      (jwt.sign as jest.Mock).mockImplementationOnce(() => newAccessToken);

      const refreshToken = 'valid-refresh-token';
      const result = await refreshAccessToken(refreshToken);

      expect(result).toHaveProperty('accessToken', newAccessToken);
      expect(result).toHaveProperty('expiresIn', 15 * 60 * 1000);
      expect(jwt.verify).toHaveBeenCalledWith(
        refreshToken,
        enirementVariables.tokenConfig.JWT_REFRESH_SECRET,
        {
          issuer: 'blog-backend',
          audience: 'blog-users',
        },
      );
    });

    /**
     * @test
     * @description Should throw when refresh token is invalid.
     */
    it('should throw error for invalid refresh token', async () => {
      await expect(refreshAccessToken('invalid-token')).rejects.toThrow('Invalid refresh token');
    });
  });

  /**
   * @group extractTokenFromHeader
   * @description Tests for extracting token string from `Authorization` header.
   */
  describe('extractTokenFromHeader', () => {
    /**
     * @test
     * @description Should extract token from valid Bearer header format.
     */
    it('should extract token from valid Bearer header', () => {
      const token = 'test-token-123';
      const result = extractTokenFromHeader(`Bearer ${token}`);
      expect(result).toBe(token);
    });

    /**
     * @test
     * @description Should return null if header is missing.
     */
    it('should return null for missing header', () => {
      expect(extractTokenFromHeader(undefined)).toBeNull();
    });

    /**
     * @test
     * @description Should return null if header format is invalid.
     */
    it('should return null for invalid header format', () => {
      expect(extractTokenFromHeader('InvalidFormat token')).toBeNull();
    });

    /**
     * @test
     * @description Should return null if Bearer prefix is missing.
     */
    it('should return null for header without Bearer prefix', () => {
      expect(extractTokenFromHeader('token-without-bearer')).toBeNull();
    });
  });
});
