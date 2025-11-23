"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, lazy, Suspense } from "react";
import { apiClient } from "@/lib/api-client";
import {
  ChildProfile,
  AgeGroup,
  getAgeGroup,
  getThemeColors,
} from "@/types";
import ImageGenerator from "@/components/ImageGenerator";
import OwlAssistant from "@/components/OwlAssistant";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorMessage } from "@/components/ErrorMessage";
import { ArrowRight } from "lucide-react";
import clsx from "clsx";

export default function ImageGeneratorPage() {
  const params = useParams();
  const router = useRouter();
  const [child, setChild] = useState<ChildProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  if (!params) {
    return <div>Loading...</div>;
  }

  const childId = params.childId as string;
  const subdomain = params.subdomain as string;

  useEffect(() => {
    fetchChildData();
  }, [childId]);

  const fetchChildData = async () => {
    try {
      setError(null);
      const response = await apiClient.get(`/api/children/${childId}`);
      setChild(response.data.child);
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

  const activeAgeGroup = getAgeGroup(child.age);
  const preferredThemeGroup = child.themePreference || activeAgeGroup;
  const theme = getThemeColors(preferredThemeGroup);

  return (
    <div
      className={clsx(
        "min-h-full flex flex-col transition-colors duration-500",
        theme.bg
      )}
    >
      <div className="p-6 flex items-center max-w-5xl mx-auto w-full">
        <button
          type="button"
          onClick={() => router.push(`/${subdomain}/child/${childId}`)}
          className="font-bold flex items-center gap-2 text-scandi-stone hover:text-scandi-chocolate bg-white px-4 py-2 rounded-full shadow-sm transition"
        >
          <ArrowRight className="rotate-180" /> Back
        </button>
      </div>

      <div className="flex-1 px-4 py-8">
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-[400px]">
              <LoadingSpinner size="lg" />
            </div>
          }
        >
          <ImageGenerator />
        </Suspense>
      </div>

      <Suspense fallback={null}>
        <OwlAssistant
          ageGroup={activeAgeGroup}
          forcedVariant={child.buddy}
        />
      </Suspense>
    </div>
  );
}

