'use client';

import AdminDashboard from '@/components/dashboards/AdminDashboard';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function AdminPage() {
  const router = useRouter();
  const { isAuthenticated, accessToken, user } = useAuthStore();

  useEffect(() => {
    // Check authentication
    const checkAuth = () => {
      // First check if we have a token
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      if (!token) {
        router.push('/admin/login');
        return;
      }

      // Check if user is authenticated in store
      if (!isAuthenticated) {
        // Try to get from localStorage
        try {
          const authStorage = typeof window !== 'undefined' ? localStorage.getItem('auth-storage') : null;
          if (authStorage) {
            const auth = JSON.parse(authStorage);
            const userRole = auth?.state?.user?.role;
            if (userRole !== 'ADMIN') {
              router.push('/admin/login');
              return;
            }
          } else {
            router.push('/admin/login');
            return;
          }
        } catch (e) {
          router.push('/admin/login');
          return;
        }
      }

      // Verify user is admin
      if (user && user.role !== 'ADMIN') {
        router.push('/admin/login');
        return;
      }
    };

    checkAuth();
  }, [isAuthenticated, accessToken, user, router]);

  // Show loading while checking auth
  if (!isAuthenticated && typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="md" color="primary" />
        </div>
      );
    }
  }

  return <AdminDashboard />;
}

