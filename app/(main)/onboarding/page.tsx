"use client";

import OnboardingFlow from "@/components/OnboardingFlow";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { buildSubdomainUrl } from "@/lib/url-utils";

export default function OnboardingPage() {
  const router = useRouter();
  const { login } = useAuthStore();

  const handleComplete = async (data: {
    familyName: string;
    subdomain: string;
    children: any[];
    user: any;
    tenant: any;
    accessToken: string;
    refreshToken: string;
  }) => {
    try {
      // Update auth store with user and tenant data
      login(
        {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
        },
        {
          id: data.tenant.id,
          subdomain: data.tenant.subdomain,
          name: data.tenant.name,
        },
        data.accessToken,
        data.refreshToken
      );

      // Redirect to parent dashboard using subdomain in URL
      const subdomain =
        data.subdomain ||
        data.familyName.toLowerCase().replace(/[^a-z0-9]/g, "-");
      window.location.href = buildSubdomainUrl(subdomain, "/parent");
    } catch (error) {
      console.error("Error completing onboarding:", error);
      // Still try to redirect even if store update fails
      const subdomain =
        data.subdomain ||
        data.familyName.toLowerCase().replace(/[^a-z0-9]/g, "-");
      window.location.href = buildSubdomainUrl(subdomain, "/parent");
    }
  };

  return (
    <OnboardingFlow
      onComplete={handleComplete}
      onCancel={() => router.push("/")}
    />
  );
}
