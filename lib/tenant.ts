import { db } from './db';
import { getTenantFromCache, setTenantInCache } from './redis';

export interface TenantData {
  id: string;
  subdomain: string;
  name: string;
  emoji?: string | null;
  active: boolean;
}

export async function getTenantFromSubdomain(subdomain: string | null | undefined): Promise<TenantData | null> {
  // Validate subdomain
  if (!subdomain || typeof subdomain !== 'string' || subdomain.trim() === '') {
    return null;
  }

  const cleanSubdomain = subdomain.trim();

  // Try cache first
  const cached = await getTenantFromCache(cleanSubdomain);
  if (cached) {
    return cached;
  }

  // Fallback to database
  const tenant = await db.tenant.findUnique({
    where: { subdomain: cleanSubdomain },
    select: {
      id: true,
      subdomain: true,
      name: true,
      emoji: true,
      active: true,
    },
  });

  if (tenant) {
    // Cache for 1 hour
    await setTenantInCache(cleanSubdomain, tenant, 3600);
    return tenant;
  }

  return null;
}

export function extractSubdomain(hostname: string, domain: string): string | null {
  if (!hostname || typeof hostname !== 'string') {
    return null;
  }

  // Remove port if present
  const host = hostname.split(':')[0].toLowerCase().trim();
  
  if (!host) {
    return null;
  }
  
  // For localhost development: subdomain.localhost or subdomain.localhost:3000
  if (host.includes('localhost')) {
    // Check if it's in format subdomain.localhost
    const parts = host.split('.');
    if (parts.length > 1 && parts[parts.length - 1] === 'localhost') {
      const subdomain = parts.slice(0, -1).join('.');
      return subdomain && subdomain.length > 0 ? subdomain : null;
    }
    return null; // Main domain (just localhost)
  }

  // For production: subdomain.brainplaykids.com
  if (host.endsWith(`.${domain}`)) {
    const subdomain = host.replace(`.${domain}`, '').trim();
    return subdomain && subdomain.length > 0 ? subdomain : null;
  }

  // Exact domain match
  if (host === domain) {
    return null; // Main domain
  }

  return null;
}

export async function validateTenant(subdomain: string): Promise<boolean> {
  const tenant = await getTenantFromSubdomain(subdomain);
  return tenant !== null && tenant.active;
}

