'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import ChildProfilePicker from '@/components/dashboards/ChildProfilePicker';
import { apiClient } from '@/lib/api-client';
import { ChildProfile } from '@/types';

export default function FamilyPortal() {
  const params = useParams();
  const router = useRouter();
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [familyName, setFamilyName] = useState<string>('Family');

  if (!params) {
    return <div>Loading...</div>;
  }

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [childrenRes, familyRes] = await Promise.all([
        apiClient.get('/api/children'),
        apiClient.get('/api/families'),
      ]);
      
      setChildren(childrenRes.data.children || []);
      if (familyRes.data?.family?.name) {
        setFamilyName(familyRes.data.family.name);
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectChild = (child: ChildProfile) => {
    router.push(`/${params.subdomain}/child/${child.id}/login`);
  };

  const handleAddChild = () => {
    router.push(`/${params.subdomain}/parent`);
  };

  const handleSettings = () => {
    router.push(`/${params.subdomain}/parent`);
  };

  const handleLogout = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-full bg-scandi-oat flex items-center justify-center">
        <LoadingSpinner size="md" color="primary" />
      </div>
    );
  }

  return (
    <ChildProfilePicker
      children={children}
      onSelectChild={selectChild}
      onAddChild={handleAddChild}
      onSettings={handleSettings}
      onLogout={handleLogout}
      familyName={familyName}
    />
  );
}

