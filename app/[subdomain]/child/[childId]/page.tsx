"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { ChildProfile } from "@/types";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorMessage } from "@/components/ErrorMessage";
import ChildDashboard from "@/components/dashboards/ChildDashboard";

export default function ChildDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const [child, setChild] = useState<ChildProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchChildData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.childId]);

  const fetchChildData = async () => {
    try {
      setError(null);
      const childRes = await apiClient.get(`/api/children/${params.childId}`);
      setChild(childRes.data.child);
    } catch (err: any) {
      console.error("Failed to fetch child data:", err);
      setError(err.message || "Failed to load child data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="md" color="primary" />
      </div>
    );
  }

  if (error || !child) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <ErrorMessage
          message={error || "Child not found"}
          onRetry={fetchChildData}
          onDismiss={() => setError(null)}
        />
      </div>
    );
  }

  return (
    <ChildDashboard
      child={child}
      onSettings={() => {
        // Settings handled within ChildDashboard
      }}
      onLogout={() => {
        router.push(`/${params.subdomain}`);
      }}
      onNavigateToGame={(moduleId) => {
        router.push(
          `/${params.subdomain}/child/${params.childId}/game/${moduleId}`
        );
      }}
      onNavigateToImageGenerator={() => {
        router.push(
          `/${params.subdomain}/child/${params.childId}/image-generator`
        );
      }}
    />
  );
}
