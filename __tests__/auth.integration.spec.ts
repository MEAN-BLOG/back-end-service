/**
 * @file authentication.test.ts
 * @description Integration tests for the Authentication API endpoints with full TypeScript JSDoc typings.
 * These tests cover user registration, login, profile retrieval, logout, and token refresh functionality.
 *
 * @jest-environment node
 */

import request from 'supertest';
import app from '../src/app';

/**
 * @typedef {Object} TestUser
 * @property {string} firstName - User's first name
 * @property {string} lastName - User's last name
 * @property {string} email - User's email address
 * @property {string} password - User's password
 */

/**
 * Test suite for the Authentication API.
 *
 * Covers the following endpoints:
 * - POST /api/v1/auth/register
 * - POST /api/v1/auth/login
 * - GET /api/v1/auth/profile
 * - POST /api/v1/auth/logout
 * - POST /api/v1/auth/refresh
 */
describe('Authentication API', () => {
  /** @type {TestUser} */
  const testUser = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    password: 'SecurePass123',
  };

  /**
   * Test suite for user registration endpoint
   * POST /api/v1/auth/register
   */
  describe('POST /api/v1/auth/register', () => {
    /**
     * @test
     * @description Registers a new user successfully
     * @returns {Promise<void>}
     */
    it('should register a new user successfully', async () => {
      const response = await request(app).post('/api/v1/auth/register').send(testUser).expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User registered successfully');
    });

    /**
     * @test
     * @description Returns 400 Bad Request when registration data is invalid
     * @returns {Promise<void>}
     */
    it('should return 400 for invalid registration data', async () => {
      const invalidUser = {
        firstName: 'J',
        email: 'invalid-email',
        password: '123',
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(invalidUser)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
      expect(response.body).toHaveProperty('errors');
    });

    /**
     * @test
     * @description Returns 409 Conflict when registering with an existing email
     * @returns {Promise<void>}
     */
    it('should return 409 for duplicate email registration', async () => {
      await request(app).post('/api/v1/auth/register').send(testUser).expect(201);

      const response = await request(app).post('/api/v1/auth/register').send(testUser).expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User already exists with this email address');
    });
  });

  /**
   * Test suite for user login endpoint
   * POST /api/v1/auth/login
   */
  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/v1/auth/register').send(testUser);
    });

    /**
     * @test
     * @description Logs in successfully with correct credentials
     * @returns {Promise<void>}
     */
    it('should login successfully with correct credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: testUser.email, password: testUser.password })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.data.user).toHaveProperty('email', testUser.email);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
    });

    /**
     * @test
     * @description Returns 401 Unauthorized for invalid email
     * @returns {Promise<void>}
     */
    it('should return 401 for invalid email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'nonexistent@example.com', password: testUser.password })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid email or password');
    });

    /**
     * @test
     * @description Returns 401 Unauthorized for invalid password
     * @returns {Promise<void>}
     */
    it('should return 401 for invalid password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: testUser.email, password: 'WrongPassword' })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid email or password');
    });
  });

  /**
   * Test suite for retrieving user profile
   * GET /api/v1/auth/profile
   */
  describe('GET /api/v1/auth/profile', () => {
    let accessToken: string;

    beforeEach(async () => {
      await request(app).post('/api/v1/auth/register').send(testUser);

      const loginResponse = await request(app).post('/api/v1/auth/login').send({
        email: testUser.email,
        password: testUser.password,
      });

      accessToken = loginResponse.body.data.accessToken;
    });

    /**
     * @test
     * @description Returns user profile for valid token
     * @returns {Promise<void>}
     */
    it('should return user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toHaveProperty('email', testUser.email);
      expect(response.body.data.user).not.toHaveProperty('password');
    });

    /**
     * @test
     * @description Returns 401 Unauthorized if token is missing
     * @returns {Promise<void>}
     */
    it('should return 401 for missing token', async () => {
      const response = await request(app).get('/api/v1/auth/profile').expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access token is required');
    });

    /**
     * @test
     * @description Returns 401 Unauthorized for invalid token
     * @returns {Promise<void>}
     */
    it('should return 401 for invalid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid access token');
    });
  });

  /**
   * Test suite for user logout endpoint
   * POST /api/v1/auth/logout
   */
  describe('POST /api/v1/auth/logout', () => {
    let accessToken: string;

    beforeEach(async () => {
      // Register and login to get access token
      await request(app).post('/api/v1/auth/register').send(testUser);

      const loginResponse = await request(app).post('/api/v1/auth/login').send({
        email: testUser.email,
        password: testUser.password,
      });

      accessToken = loginResponse.body.data.accessToken;
    });

    /**
     * @test
     * @description Logs out successfully with valid token
     * @returns {Promise<void>}
     */
    it('should logout successfully with valid token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Logged out successfully');
    });
  });

  /**
   * Test suite for token refresh endpoint
   * POST /api/v1/auth/refresh
   */
  describe('POST /api/v1/auth/refresh', () => {
    let refreshToken: string;

    beforeEach(async () => {
      await request(app).post('/api/v1/auth/register').send(testUser);

      const loginResponse = await request(app).post('/api/v1/auth/login').send({
        email: testUser.email,
        password: testUser.password,
      });

      refreshToken = loginResponse.body.data.refreshToken;
    });

    /**
     * @test
     * @description Refreshes access token successfully with valid refresh token
     * @returns {Promise<void>}
     */
    it('should refresh token successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('expiresIn');
    });

    /**
     * @test
     * @description Returns 400 Bad Request if refresh token is missing
     * @returns {Promise<void>}
     */
    it('should return 400 for missing refresh token', async () => {
      const response = await request(app).post('/api/v1/auth/refresh').send({}).expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Refresh token is required');
    });
  });
});
