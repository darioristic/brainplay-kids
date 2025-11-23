"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/stores/authStore";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorMessage } from "@/components/ErrorMessage";
import { ArrowRight, Lock, Mail } from "lucide-react";

export default function ParentLoginPage() {
  const params = useParams();
  const router = useRouter();
  const { login } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subdomain = params.subdomain as string;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await apiClient.post("/api/auth/login", {
        email,
        password,
      });

      const { user, tenant, accessToken, refreshToken } = response.data;

      // Update auth store
      login(user, tenant, accessToken, refreshToken);

      // Redirect to parent dashboard
      router.push(`/${subdomain}/parent`);
    } catch (err: any) {
      console.error("Login failed:", err);
      setError(
        err.response?.data?.error ||
          err.message ||
          "Invalid email or password. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-scandi-cream flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-soft-lg border border-scandi-oat">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-scandi-moss/10 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Lock className="text-scandi-moss" size={32} />
            </div>
            <h2 className="text-3xl font-kids font-bold text-scandi-chocolate mb-2">
              Parent Login
            </h2>
            <p className="text-scandi-stone">
              Enter your credentials to access the dashboard
            </p>
          </div>

          {error && (
            <div className="mb-6">
              <ErrorMessage
                message={error}
                onDismiss={() => setError(null)}
                variant="inline"
              />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-scandi-stone mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-scandi-stone w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full pl-12 pr-4 py-3 bg-scandi-cream border-2 border-transparent focus:border-scandi-honey rounded-xl outline-none font-bold text-scandi-chocolate transition"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-scandi-stone mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-scandi-stone w-5 h-5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-12 pr-4 py-3 bg-scandi-cream border-2 border-transparent focus:border-scandi-honey rounded-xl outline-none font-bold text-scandi-chocolate transition"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-scandi-moss hover:bg-opacity-90 text-white rounded-full font-bold text-lg shadow-toy active:shadow-toy-active active:translate-y-[4px] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" color="white" />
                  Logging in...
                </>
              ) : (
                <>
                  Login <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => router.push(`/${subdomain}`)}
              className="text-sm text-scandi-stone hover:text-scandi-chocolate font-bold transition"
            >
              ← Back to Family Portal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

