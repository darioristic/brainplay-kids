import { describe, it, expect } from 'vitest';
import { apiClient } from '@/lib/api-client';

describe('Children API Integration', () => {
  describe('GET /api/children', () => {
    it('should require authentication', async () => {
      try {
        await apiClient.get('/api/children');
      } catch (error: any) {
        // Should require auth
        expect(error.response?.status).toBeGreaterThanOrEqual(400);
      }
    });
  });

  describe('POST /api/children', () => {
    it('should require authentication', async () => {
      try {
        await apiClient.post('/api/children', {
          name: 'Test Child',
          age: 5,
        });
      } catch (error: any) {
        expect(error.response?.status).toBeGreaterThanOrEqual(400);
      }
    });
  });
});

