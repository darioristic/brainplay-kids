import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// Get base URL - use current origin in browser, or env variable
const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    // In browser, use current origin (works with subdomains)
    return window.location.origin;
  }
  // Server-side, use env variable or default
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
};

// Helper to get tenant ID from auth store or localStorage
const getTenantId = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  // Try to get from auth store (if available)
  try {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      const auth = JSON.parse(authStorage);
      if (auth?.state?.tenant?.id) {
        return auth.state.tenant.id;
      }
    }
  } catch (e) {
    // Ignore parse errors
  }
  
  return null;
};

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: getBaseURL(),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for JWT token and tenant ID
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('accessToken');
          if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
          }
          
          // Add tenant ID header if available
          const tenantId = getTenantId();
          if (tenantId && config.headers) {
            config.headers['x-tenant-id'] = tenantId;
          }
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for token refresh and error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Handle 401 Unauthorized - try to refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
              const baseURL = getBaseURL();
              const response = await axios.post(`${baseURL}/api/auth/refresh`, {
                refreshToken,
              });

              const { accessToken } = response.data;
              localStorage.setItem('accessToken', accessToken);

              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              }

              return this.client(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, redirect to login
            if (typeof window !== 'undefined') {
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
              window.location.href = '/';
            }
            return Promise.reject(refreshError);
          }
        }

        // Enhance error with user-friendly message
        const enhancedError = {
          ...error,
          message: this.getErrorMessage(error),
        };

        return Promise.reject(enhancedError);
      }
    );
  }

  private getErrorMessage(error: any): string {
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const data = error.response.data;

      // Try to get error message from response
      if (data?.error) {
        return data.error;
      }
      if (data?.message) {
        return data.message;
      }

      // Default messages based on status code
      switch (status) {
        case 400:
          return 'Invalid request. Please check your input.';
        case 401:
          return 'You are not authorized. Please log in again.';
        case 403:
          return 'You do not have permission to perform this action.';
        case 404:
          return 'The requested resource was not found.';
        case 409:
          return 'This action conflicts with existing data.';
        case 422:
          return 'Validation failed. Please check your input.';
        case 429:
          return 'Too many requests. Please try again later.';
        case 500:
          return 'Server error. Please try again later.';
        case 503:
          return 'Service temporarily unavailable. Please try again later.';
        default:
          return `Request failed with status ${status}.`;
      }
    }

    if (error.request) {
      // Request was made but no response received
      return 'Network error. Please check your connection and try again.';
    }

    // Something else happened
    return error.message || 'An unexpected error occurred. Please try again.';
  }

  get instance() {
    return this.client;
  }
}

export const apiClient = new ApiClient().instance;

