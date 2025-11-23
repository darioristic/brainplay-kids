import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '@/stores/authStore';

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      tenant: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
  });

  it('should have initial state', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.tenant).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('should login user', () => {
    const user = { id: '1', email: 'test@example.com', name: 'Test User' };
    const tenant = { id: '1', subdomain: 'test', name: 'Test Tenant' };
    
    useAuthStore.getState().login(user, tenant, 'access-token', 'refresh-token');
    
    const state = useAuthStore.getState();
    expect(state.user).toEqual(user);
    expect(state.tenant).toEqual(tenant);
    expect(state.isAuthenticated).toBe(true);
    expect(state.accessToken).toBe('access-token');
  });

  it('should logout user', () => {
    const user = { id: '1', email: 'test@example.com', name: 'Test User' };
    const tenant = { id: '1', subdomain: 'test', name: 'Test Tenant' };
    
    useAuthStore.getState().login(user, tenant, 'access-token', 'refresh-token');
    useAuthStore.getState().logout();
    
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('should update token', () => {
    useAuthStore.getState().updateToken('new-access-token');
    const state = useAuthStore.getState();
    expect(state.accessToken).toBe('new-access-token');
  });
});

