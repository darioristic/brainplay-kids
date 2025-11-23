import { describe, it, expect, vi, beforeEach } from 'vitest';
import { extractSubdomain, validateTenant } from '@/lib/tenant';

// Mock dependencies
vi.mock('@/lib/db', () => ({
  db: {
    tenant: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('@/lib/redis', () => ({
  getTenantFromCache: vi.fn(),
  setTenantInCache: vi.fn(),
}));

describe('tenant', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('extractSubdomain', () => {
    it('should extract subdomain from hostname', () => {
      const result = extractSubdomain('smith.brainplaykids.com', 'brainplaykids.com');
      expect(result).toBe('smith');
    });

    it('should return null for main domain', () => {
      const result = extractSubdomain('brainplaykids.com', 'brainplaykids.com');
      expect(result).toBeNull();
    });

    it('should handle localhost with subdomain', () => {
      const result = extractSubdomain('smith.localhost', 'localhost');
      expect(result).toBe('smith');
    });

    it('should return null for plain localhost', () => {
      const result = extractSubdomain('localhost', 'localhost');
      expect(result).toBeNull();
    });

    it('should handle port numbers', () => {
      const result = extractSubdomain('smith.brainplaykids.com:3000', 'brainplaykids.com');
      expect(result).toBe('smith');
    });
  });
});

