import { NextRequest } from 'next/server';
import { verifyAccessToken, JWTPayload } from './auth';

export function getAuthFromRequest(request: NextRequest): JWTPayload | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  return verifyAccessToken(token);
}

export function getTenantIdFromRequest(request: NextRequest): string | null {
  return request.headers.get('x-tenant-id');
}

