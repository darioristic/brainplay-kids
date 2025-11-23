import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { extractSubdomain, getTenantFromSubdomain } from '@/lib/tenant';

const MAIN_DOMAIN = process.env.NEXT_PUBLIC_DOMAIN || 'brainplaykids.com';

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const subdomain = extractSubdomain(hostname, MAIN_DOMAIN);

  // Main domain routes - allow through
  if (!subdomain) {
    // Check if it's a main domain route
    if (
      request.nextUrl.pathname.startsWith('/api/tenants') ||
      request.nextUrl.pathname.startsWith('/admin') ||
      request.nextUrl.pathname === '/' ||
      request.nextUrl.pathname.startsWith('/onboarding')
    ) {
      return NextResponse.next();
    }
  }

  // Subdomain routes
  if (subdomain) {
    // Validate tenant exists
    const tenant = await getTenantFromSubdomain(subdomain);
    
    if (!tenant || !tenant.active) {
      // Invalid subdomain - redirect to main domain
      const url = request.nextUrl.clone();
      // Use https for production, http for localhost
      const isProduction = !hostname.includes('localhost');
      url.protocol = isProduction ? 'https:' : 'http:';
      url.host = MAIN_DOMAIN;
      url.pathname = '/';
      return NextResponse.redirect(url);
    }

    // Add tenant info to headers for use in API routes
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-tenant-id', tenant.id);
    requestHeaders.set('x-tenant-subdomain', tenant.subdomain);

    // Rewrite to [subdomain] route
    const url = request.nextUrl.clone();
    url.pathname = `/${subdomain}${url.pathname}`;
    
    return NextResponse.rewrite(url, {
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

