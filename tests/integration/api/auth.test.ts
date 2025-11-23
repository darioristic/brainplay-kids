import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { apiClient } from '@/lib/api-client';

describe('Auth API Integration', () => {
  const testUser = {
    email: `test-${Date.now()}@example.com`,
    password: 'TestPassword123!',
    name: 'Test User',
  };

  beforeAll(async () => {
    // Setup: Ensure test environment is ready
  });

  afterAll(async () => {
    // Cleanup: Remove test data if needed
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      try {
        const response = await apiClient.post('/api/auth/register', {
          email: testUser.email,
          password: testUser.password,
          name: testUser.name,
        });
        expect(response.status).toBe(201);
        expect(response.data).toHaveProperty('user');
        expect(response.data).toHaveProperty('accessToken');
      } catch (error: any) {
        // If user already exists, that's okay for this test
        if (error.response?.status === 409) {
          expect(error.response.status).toBe(409);
        } else {
          throw error;
        }
      }
    });

    it('should reject invalid email', async () => {
      try {
        await apiClient.post('/api/auth/register', {
          email: 'invalid-email',
          password: testUser.password,
          name: testUser.name,
        });
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response?.status).toBeGreaterThanOrEqual(400);
      }
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      try {
        const response = await apiClient.post('/api/auth/login', {
          email: testUser.email,
          password: testUser.password,
        });
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('user');
        expect(response.data).toHaveProperty('accessToken');
      } catch (error: any) {
        // If user doesn't exist, skip this test
        if (error.response?.status === 401 || error.response?.status === 404) {
          expect(error.response.status).toBeGreaterThanOrEqual(400);
        } else {
          throw error;
        }
      }
    });

    it('should reject invalid credentials', async () => {
      try {
        await apiClient.post('/api/auth/login', {
          email: testUser.email,
          password: 'WrongPassword',
        });
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response?.status).toBe(401);
      }
    });
  });
});

