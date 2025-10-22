// auth.middleware.spec.ts
import { Response, NextFunction } from 'express';
import { authenticate, authorize } from '../src/middlewares/auth.middleware';
import UserModel from '../src/modules/users/user.model';
import { UserRole } from '../src/modules/shared/enums/role.enum';
import { IUser } from '../src/modules/shared';
import { verifyAccessToken } from '../src/utils/jwt';

// Mock the UserModel
jest.mock('../src/modules/users/user.model');

// Mock JWT functions
jest.mock('../src/utils/jwt', () => ({
  verifyAccessToken: jest.fn(),
  extractTokenFromHeader: jest.fn((header) => (header ? header.split(' ')[1] : null)),
}));

// Mock abilities
jest.mock('../src/abilities/abilities', () => ({
  defineAbilitiesFor: jest.fn().mockReturnValue({
    can: jest.fn().mockReturnValue(true),
    cannot: jest.fn().mockReturnValue(false),
  }),
}));

// Test user
const testUser = {
  _id: '68f8075d99a99c2ffdf5e851',
  email: 'john.doe@example.com',
  role: UserRole.GUEST,
  save: jest.fn(),
  toObject: jest.fn().mockReturnThis(),
} as any;

// Mock request
const mockRequest = (authHeader?: string, user?: IUser) => ({
  headers: {
    authorization: authHeader,
  },
  user,
  ability: undefined,
});

// Mock response
const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

const mockNext = jest.fn() as NextFunction;

describe('Authentication Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (UserModel.findById as jest.Mock).mockResolvedValue(testUser);
    (verifyAccessToken as jest.Mock).mockResolvedValue({ userId: testUser._id });
  });

  describe('authenticate', () => {
    it('should return 401 if no token is provided', async () => {
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

    it('should return 401 if token is invalid', async () => {
      (verifyAccessToken as jest.Mock).mockRejectedValueOnce({
        name: 'JsonWebTokenError',
      });

      const req = mockRequest('Bearer invalid-token');
      const res = mockResponse();

      try {
        await authenticate(req as any, res, mockNext);
      } catch (error) {
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          message: 'Invalid token',
        });
      }

      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('authorize', () => {
    it('should allow access for user with required role', async () => {
      const adminUser = { ...testUser, role: UserRole.ADMIN };
      const req = mockRequest(undefined, adminUser);
      const res = mockResponse();
      const middleware = authorize(UserRole.ADMIN);

      await middleware(req as any, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should deny access for user with insufficient role', async () => {
      const req = mockRequest(undefined, testUser); // testUser is WRITER
      const res = mockResponse();
      const middleware = authorize(UserRole.ADMIN);

      await middleware(req as any, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Insufficient permissions',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 if user is not authenticated', async () => {
      const req = mockRequest();
      const res = mockResponse();
      const middleware = authorize(UserRole.GUEST);

      await middleware(req as any, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Authentication required',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
