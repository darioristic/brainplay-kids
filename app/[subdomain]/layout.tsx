import { getTenantFromSubdomain } from '@/lib/tenant';
import { notFound } from 'next/navigation';

export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = await params;
  // Validate subdomain parameter
  if (!subdomain || typeof subdomain !== 'string' || subdomain.trim() === '') {
    notFound();
  }

  const tenant = await getTenantFromSubdomain(subdomain);

  if (!tenant || !tenant.active) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}

