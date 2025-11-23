import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  hashPassword,
  verifyPassword,
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashPIN,
  verifyPIN,
} from '@/lib/auth';

describe('auth', () => {
  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'testpassword123';
      const hash = await hashPassword(password);
      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);
    });
  });

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const password = 'testpassword123';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'testpassword123';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword('wrongpassword', hash);
      expect(isValid).toBe(false);
    });
  });

  describe('generateAccessToken', () => {
    it('should generate a JWT token', () => {
      const payload = {
        userId: '123',
        email: 'test@example.com',
        role: 'PARENT',
        tenantId: 'tenant1',
      };
      const token = generateAccessToken(payload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWT has 3 parts
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify valid token', () => {
      const payload = {
        userId: '123',
        email: 'test@example.com',
        role: 'PARENT',
        tenantId: 'tenant1',
      };
      const token = generateAccessToken(payload);
      const verified = verifyAccessToken(token);
      expect(verified).not.toBeNull();
      expect(verified?.userId).toBe('123');
      expect(verified?.email).toBe('test@example.com');
    });

    it('should return null for invalid token', () => {
      const verified = verifyAccessToken('invalid.token.here');
      expect(verified).toBeNull();
    });
  });

  describe('hashPIN and verifyPIN', () => {
    it('should hash and verify PIN', async () => {
      const pin = '1234';
      const hash = await hashPIN(pin);
      expect(hash).toBeDefined();
      
      const isValid = await verifyPIN(pin, hash);
      expect(isValid).toBe(true);
      
      const isInvalid = await verifyPIN('5678', hash);
      expect(isInvalid).toBe(false);
    });
  });
});

