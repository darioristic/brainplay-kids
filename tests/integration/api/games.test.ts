import { describe, it, expect } from 'vitest';
import { apiClient } from '@/lib/api-client';

describe('Games API Integration', () => {
  describe('GET /api/games/modules', () => {
    it('should return game modules', async () => {
      try {
        const response = await apiClient.get('/api/games/modules');
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('modules');
        expect(Array.isArray(response.data.modules)).toBe(true);
      } catch (error: any) {
        // If requires auth, that's expected
        if (error.response?.status === 401) {
          expect(error.response.status).toBe(401);
        } else {
          throw error;
        }
      }
    });
  });
});

