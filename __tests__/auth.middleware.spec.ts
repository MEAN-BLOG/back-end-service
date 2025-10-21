/**
 * @file auth.middleware.test.ts
 * @description Integration tests for authentication and authorization middleware.
 * These tests cover:
 * - `authenticate` middleware
 * - `authorize` middleware
 * - Role-based middleware shortcuts (`requireAdmin`, `requireEditorOrAdmin`, `requireWriterOrAbove`, `requireAuth`)
 * - `optionalAuth` middleware
 *
 * The tests verify correct user authentication, authorization checks, and error handling for missing/invalid tokens.
 *
 * @jest-environment node
 */

import { Request, Response, NextFunction } from 'express';
import UserModel from '../src/modules/users/user.model';
import {
  authenticate,
  authorize,
  optionalAuth,
  requireAdmin,
  requireEditorOrAdmin,
  requireWriterOrAbove,
  requireAuth,
} from '../src/middlewares/auth.middleware';
import { generateTokens } from '../src/utils/jwt';
import { Types } from 'mongoose';

/**
 * Helper function to mock a request object.
 * @param {string} [authHeader] - Optional authorization header
 * @param {any} [user] - Optional user object
 * @returns {Request & { user?: any }}
 */
const mockRequest = (authHeader?: string, user?: any) =>
  ({
    headers: authHeader ? { authorization: authHeader } : {},
    user,
  }) as Request & { user?: any };

/**
 * Helper function to mock a response object
 * @returns {Response}
 */
const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

/** Mock NextFunction */
const mockNext = jest.fn() as NextFunction;

describe('Authentication Middleware', () => {
  /** @type {any} Test user instance */
  let testUser: any;

  /** @type {string} Access token for test user */
  let accessToken: string;

  beforeEach(async () => {
    testUser = await UserModel.create({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'SecurePass123',
      role: 'guest',
    });

    const tokens = await generateTokens({
      _id: testUser._id,
      email: testUser.email,
      role: testUser.role,
    });

    accessToken = tokens.accessToken;

    jest.clearAllMocks();
  });

  /**
   * @description Tests for the `authenticate` middleware.
   * Ensures valid tokens attach user info to request and invalid/missing tokens return 401.
   */
  describe('authenticate middleware', () => {
    /**
     * @test
     * @description Authenticates user with valid token
     */
    it('should authenticate user with valid token', async () => {
      const req = mockRequest(`Bearer ${accessToken}`);
      const res = mockResponse();

      await authenticate(req as any, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(req.user).toBeDefined();
      expect(req.user?.userId).toBe(testUser._id.toString());
      expect(req.user?.email).toBe(testUser.email);
      expect(req.user?.role).toBe(testUser.role);
    });

    /**
     * @test
     * @description Returns 401 if token is missing
     */
    it('should return 401 for missing token', async () => {
      const req = mockRequest();
      const res = mockResponse();

      await authenticate(req as any, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Access token is required',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    /**
     * @test
     * @description Returns 401 for invalid token
     */
    it('should return 401 for invalid token', async () => {
      const req = mockRequest('Bearer invalid-token');
      const res = mockResponse();

      await authenticate(req as any, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid access token',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    /**
     * @test
     * @description Returns 401 if user not found in DB
     */
    it('should return 401 for user not found in database', async () => {
      await UserModel.findByIdAndDelete(testUser._id);

      const req = mockRequest(`Bearer ${accessToken}`);
      const res = mockResponse();

      await authenticate(req as any, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'User not found',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
  /**
   * @description Tests for `authorize` middleware.
   * Ensures users with required roles pass, and others fail with 403.
   */
  describe('authorize middleware', () => {
    /**
     * @test
     * @description Allows access when the user has a required role.
     */
    it('should allow access for user with required role', async () => {
      const req = mockRequest(`Bearer ${accessToken}`, { role: 'guest' });
      const res = mockResponse();
      const authMiddleware = authorize(['guest']);

      await authMiddleware(req as any, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    /**
     * @test
     * @description Denies access when the user does not have the required role (403).
     */
    it('should deny access for user without required role', async () => {
      const req = mockRequest(`Bearer ${accessToken}`, { role: 'guest' });
      const res = mockResponse();
      const authMiddleware = authorize(['admin']);

      await authMiddleware(req as any, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Insufficient permissions',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    /**
     * @test
     * @description Returns 401 Unauthorized if the user is not authenticated.
     */
    it('should return 401 for unauthenticated user', async () => {
      const req = mockRequest();
      const res = mockResponse();
      const authMiddleware = authorize(['admin']);

      await authMiddleware(req as any, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Authentication required',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  /**
   * @description Tests for role-based shortcut middlewares.
   * Validates access based on user roles and aliases.
   */
  describe('role-based middleware shortcuts', () => {
    /**
     * @test
     * @description Allows access to users with `admin` role.
     */
    it('should work with requireAdmin middleware', async () => {
      const adminUser = await UserModel.create({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        password: 'SecurePass123',
        role: 'admin',
      });

      const adminTokens = await generateTokens({
        _id: new Types.ObjectId(adminUser._id as string),
        email: adminUser.email,
        role: adminUser.role,
      });

      const req = mockRequest(`Bearer ${adminTokens.accessToken}`, { role: 'admin' });
      const res = mockResponse();

      await requireAdmin(req as any, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    /**
     * @test
     * @description Allows access to users with `editor` or `admin` role.
     */
    it('should work with requireEditorOrAdmin middleware', async () => {
      const editorUser = await UserModel.create({
        firstName: 'Editor',
        lastName: 'User',
        email: 'editor@example.com',
        password: 'SecurePass123',
        role: 'editor',
      });

      const editorTokens = await generateTokens({
        _id: new Types.ObjectId(editorUser._id as string),
        email: editorUser.email,
        role: editorUser.role,
      });

      const req = mockRequest(`Bearer ${editorTokens.accessToken}`, { role: 'editor' });
      const res = mockResponse();

      await requireEditorOrAdmin(req as any, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    /**
     * @test
     * @description Allows access to users with `writer` role or higher (editor/admin).
     */
    it('should work with requireWriterOrAbove middleware', async () => {
      const writerUser = await UserModel.create({
        firstName: 'Writer',
        lastName: 'User',
        email: 'writer@example.com',
        password: 'SecurePass123',
        role: 'writer',
      });

      const writerTokens = await generateTokens({
        _id: new Types.ObjectId(writerUser._id as string),
        email: writerUser.email,
        role: writerUser.role,
      });

      const req = mockRequest(`Bearer ${writerTokens.accessToken}`, { role: 'writer' });
      const res = mockResponse();

      await requireWriterOrAbove(req as any, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    /**
     * @test
     * @description Acts as an alias for `authenticate` middleware to require any authenticated user.
     */
    it('should work with requireAuth middleware (alias for authenticate)', async () => {
      const req = mockRequest(`Bearer ${accessToken}`, { role: 'guest' });
      const res = mockResponse();

      await requireAuth(req as any, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(req.user).toBeDefined();
    });
  });

  /**
   * @description Tests for `optionalAuth` middleware.
   * Ensures user info is attached if a valid token is present and allows requests to proceed if missing/invalid.
   */
  describe('optionalAuth middleware', () => {
    /**
     * @test
     * @description Attaches user info when a valid token is provided.
     */
    it('should attach user info when token is present', async () => {
      const req = mockRequest(`Bearer ${accessToken}`);
      const res = mockResponse();

      await optionalAuth(req as any, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(req.user).toBeDefined();
      expect(req.user?.userId).toBe(testUser._id.toString());
    });

    /**
     * @test
     * @description Continues normally when token is missing.
     */
    it('should continue without error when token is missing', async () => {
      const req = mockRequest();
      const res = mockResponse();

      await optionalAuth(req as any, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(req.user).toBeUndefined();
    });

    /**
     * @test
     * @description Continues normally when token is invalid.
     */
    it('should continue without error when token is invalid', async () => {
      const req = mockRequest('Bearer invalid-token');
      const res = mockResponse();

      await optionalAuth(req as any, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(req.user).toBeUndefined();
    });
  });
});
