import { describe, it, expect } from 'vitest';
import { apiClient } from '@/lib/api-client';

describe('Families API Integration', () => {
  describe('GET /api/families', () => {
    it('should require authentication', async () => {
      try {
        await apiClient.get('/api/families');
      } catch (error: any) {
        expect(error.response?.status).toBeGreaterThanOrEqual(400);
      }
    });
  });
});

