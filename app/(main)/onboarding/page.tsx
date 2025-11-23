"use client";

import OnboardingFlow from "@/components/OnboardingFlow";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";

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
      // For development: use subdomain.localhost:3000
      // For production: use subdomain.brainplaykids.com
      const subdomain =
        data.subdomain ||
        data.familyName.toLowerCase().replace(/[^a-z0-9]/g, "-");
      const isDevelopment =
        typeof window !== "undefined" &&
        window.location.hostname === "localhost";

      if (isDevelopment) {
        // Development: redirect to subdomain.localhost:3000
        const port = window.location.port || "3000";
        window.location.href = `http://${subdomain}.localhost:${port}/parent`;
      } else {
        // Production: redirect to subdomain.brainplaykids.com
        const domain = process.env.NEXT_PUBLIC_DOMAIN || "brainplaykids.com";
        window.location.href = `https://${subdomain}.${domain}/parent`;
      }
    } catch (error) {
      console.error("Error completing onboarding:", error);
      // Still try to redirect even if store update fails
      const subdomain =
        data.subdomain ||
        data.familyName.toLowerCase().replace(/[^a-z0-9]/g, "-");
      const isDevelopment =
        typeof window !== "undefined" &&
        window.location.hostname === "localhost";

      if (isDevelopment) {
        const port = window.location.port || "3000";
        window.location.href = `http://${subdomain}.localhost:${port}/parent`;
      } else {
        const domain = process.env.NEXT_PUBLIC_DOMAIN || "brainplaykids.com";
        window.location.href = `https://${subdomain}.${domain}/parent`;
      }
    }
  };

  return (
    <OnboardingFlow
      onComplete={handleComplete}
      onCancel={() => router.push("/")}
    />
  );
}
