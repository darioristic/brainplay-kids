"use client";

import PremiumParentDashboard from "@/components/dashboards/PremiumParentDashboard";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorMessage } from "@/components/ErrorMessage";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { ChildProfile } from "@/types";
import { useAuthStore } from "@/stores/authStore";

interface FamilyStats {
  totalPoints: number;
  totalSessions: number;
  activeChildren: number;
  weeklySessions: number;
  children: Array<{
    id: string;
    name: string;
    points: number;
    progress: number;
  }>;
}

export default function ParentDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, accessToken } = useAuthStore();
  const [childrenData, setChildrenData] = useState<ChildProfile[]>([]);
  const [familyStats, setFamilyStats] = useState<FamilyStats | null>(null);
  const [familyId, setFamilyId] = useState<string | undefined>(undefined);
  const [familyName, setFamilyName] = useState<string>("Family");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  if (!params) {
    return <div>Loading...</div>;
  }

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated && !accessToken) {
      // Check localStorage as fallback
      const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
      if (!token) {
        router.push(`/${params.subdomain}/parent/login`);
        return;
      }
    }
    
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, accessToken]);

  const fetchData = async () => {
    try {
      setError(null);
      setLoading(true);
      
      const [childrenRes, familyRes] = await Promise.all([
        apiClient.get("/api/children"),
        apiClient.get("/api/families"),
      ]);

      const children = childrenRes.data.children || [];
      setChildrenData(children);

      const family = familyRes.data.family;
      if (family?.id) {
        setFamilyId(family.id);
        setFamilyName(family.name || "Family");
        
        try {
          const statsRes = await apiClient.get(`/api/families/${family.id}/stats`);
          setFamilyStats(statsRes.data.stats);
        } catch (statsErr: any) {
          console.error("Failed to fetch family stats:", statsErr);
          // Don't fail the whole page if stats fail, just log it
          setFamilyStats({
            totalPoints: 0,
            totalSessions: 0,
            activeChildren: children.length,
            weeklySessions: 0,
            children: children.map((child: ChildProfile) => ({
              id: child.id,
              name: child.name,
              points: child.points || 0,
              progress: 0,
            })),
          });
        }
      } else {
        throw new Error("Family not found");
      }
    } catch (err: any) {
      console.error("Failed to fetch data:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);
      
      let errorMessage = "Failed to load dashboard data. Please try again.";
      
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <ErrorMessage
          message={error}
          onRetry={fetchData}
          onDismiss={() => setError(null)}
        />
      </div>
    );
  }

  return (
    <PremiumParentDashboard
      childrenData={childrenData}
      familyStats={familyStats}
      familyId={familyId}
      familyName={familyName}
      onRefresh={fetchData}
    />
  );
}
