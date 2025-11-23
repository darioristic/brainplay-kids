"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/stores/authStore";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorMessage } from "@/components/ErrorMessage";
import { ArrowRight, Lock, Mail, Shield, AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adminCheck, setAdminCheck] = useState<{ exists: boolean; message?: string } | null>(null);

  // Check if admin user exists on mount
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const response = await apiClient.get("/api/auth/admin-login/check");
        setAdminCheck(response.data);
      } catch (err) {
        // Silently fail - don't show error for check
        console.error("Failed to check admin user:", err);
      }
    };
    checkAdmin();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await apiClient.post("/api/auth/admin-login", {
        email,
        password,
      });

      const { user, accessToken, refreshToken } = response.data;

      // Update auth store - admin doesn't need tenant
      login(
        user,
        {
          id: "admin",
          subdomain: "admin",
          name: "Admin",
        },
        accessToken,
        refreshToken
      );

      // Redirect to admin dashboard
      router.push("/admin");
    } catch (err: any) {
      console.error("Admin login failed:", err);
      console.error("Error response:", err.response?.data);
      
      let errorMessage = "Invalid email or password. Please try again.";
      
      if (err.response?.data) {
        if (err.response.data.error) {
          errorMessage = err.response.data.error;
        }
        if (err.response.data.message) {
          errorMessage = err.response.data.message;
        }
        // Show details in development
        if (process.env.NODE_ENV === 'development' && err.response.data.details) {
          errorMessage += `\n\nDetails: ${err.response.data.details}`;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-scandi-cream flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-[2rem] shadow-soft-lg border border-scandi-oat p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-scandi-moss/20 rounded-full mx-auto flex items-center justify-center mb-4">
              <Shield className="text-scandi-moss" size={32} />
            </div>
            <h1 className="text-3xl font-bold text-scandi-chocolate font-kids mb-2">
              Admin Login
            </h1>
            <p className="text-scandi-stone">
              Access the platform management dashboard
            </p>
          </div>

          {/* Admin Check Message */}
          {adminCheck && !adminCheck.exists && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
                <div className="flex-1">
                  <p className="text-sm font-bold text-yellow-800">Admin User Not Found</p>
                  <p className="text-sm text-yellow-700 mt-1">
                    {adminCheck.message || "Please run: npm run db:seed"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6">
              <ErrorMessage
                message={error}
                onDismiss={() => setError(null)}
                variant="inline"
              />
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-scandi-stone mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-scandi-stone" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-scandi-cream border-2 border-transparent focus:border-scandi-moss rounded-xl outline-none font-medium text-scandi-chocolate transition"
                  placeholder="admin@example.com"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-scandi-stone mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-scandi-stone" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-scandi-cream border-2 border-transparent focus:border-scandi-moss rounded-xl outline-none font-medium text-scandi-chocolate transition"
                  placeholder="••••••••"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !email || !password}
              className="w-full py-4 bg-scandi-moss hover:bg-opacity-90 text-white rounded-full font-bold text-lg shadow-toy active:shadow-toy-active active:translate-y-[4px] transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" color="white" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-sm text-scandi-stone hover:text-scandi-moss transition"
            >
              ← Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

