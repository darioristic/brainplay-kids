/**
 * Utility functions for handling URLs in both development and production
 */

/**
 * Get the base domain for the application
 */
export function getBaseDomain(): string {
  if (typeof window !== 'undefined') {
    // In browser, extract domain from current location
    const hostname = window.location.hostname;
    
    // For localhost development
    if (hostname === 'localhost' || hostname.includes('localhost')) {
      return 'localhost';
    }
    
    // For production, extract main domain
    // e.g., brainplaykids.com or subdomain.brainplaykids.com -> brainplaykids.com
    const parts = hostname.split('.');
    if (parts.length >= 2) {
      return parts.slice(-2).join('.'); // Get last two parts (e.g., brainplaykids.com)
    }
    
    return hostname;
  }
  
  // Server-side: use environment variable
  return process.env.NEXT_PUBLIC_DOMAIN || 'brainplaykids.com';
}

/**
 * Check if we're in development mode
 */
export function isDevelopment(): boolean {
  if (typeof window !== 'undefined') {
    return window.location.hostname === 'localhost' || window.location.hostname.includes('localhost');
  }
  return process.env.NODE_ENV === 'development';
}

/**
 * Get the protocol (http or https)
 */
export function getProtocol(): string {
  if (typeof window !== 'undefined') {
    return window.location.protocol;
  }
  return isDevelopment() ? 'http:' : 'https:';
}

/**
 * Build a subdomain URL
 */
export function buildSubdomainUrl(subdomain: string, path: string = ''): string {
  const isDev = isDevelopment();
  const protocol = isDev ? 'http' : 'https';
  const domain = getBaseDomain();
  
  if (isDev) {
    const port = typeof window !== 'undefined' ? window.location.port || '3000' : '3000';
    return `${protocol}://${subdomain}.localhost:${port}${path}`;
  }
  
  return `${protocol}://${subdomain}.${domain}${path}`;
}

/**
 * Get the current subdomain from hostname
 */
export function getCurrentSubdomain(): string | null {
  if (typeof window === 'undefined') return null;
  
  const hostname = window.location.hostname;
  const domain = getBaseDomain();
  
  if (hostname === domain || hostname === 'localhost') {
    return null; // Main domain
  }
  
  // Extract subdomain
  if (hostname.endsWith(`.${domain}`)) {
    return hostname.replace(`.${domain}`, '');
  }
  
  if (hostname.includes('.localhost')) {
    const parts = hostname.split('.');
    if (parts.length > 1 && parts[parts.length - 1] === 'localhost') {
      return parts.slice(0, -1).join('.');
    }
  }
  
  return null;
}

