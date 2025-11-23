import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { apiClient } from '@/lib/api-client';

// Mock axios
vi.mock('axios');
vi.mock('@/lib/api-client', async () => {
  const actual = await vi.importActual('@/lib/api-client');
  return actual;
});

describe('api-client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
  });

  it('should be defined', () => {
    expect(apiClient).toBeDefined();
  });

  it('should have get method', () => {
    expect(apiClient.get).toBeDefined();
    expect(typeof apiClient.get).toBe('function');
  });

  it('should have post method', () => {
    expect(apiClient.post).toBeDefined();
    expect(typeof apiClient.post).toBe('function');
  });

  it('should have put method', () => {
    expect(apiClient.put).toBeDefined();
    expect(typeof apiClient.put).toBe('function');
  });

  it('should have delete method', () => {
    expect(apiClient.delete).toBeDefined();
    expect(typeof apiClient.delete).toBe('function');
  });
});

