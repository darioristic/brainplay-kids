import { getTenantFromSubdomain } from '@/lib/tenant';
import { notFound } from 'next/navigation';

export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { subdomain: string };
}) {
  // Validate subdomain parameter
  if (!params.subdomain || typeof params.subdomain !== 'string' || params.subdomain.trim() === '') {
    notFound();
  }

  const tenant = await getTenantFromSubdomain(params.subdomain);

  if (!tenant || !tenant.active) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}

