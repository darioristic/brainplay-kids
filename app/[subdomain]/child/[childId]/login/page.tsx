"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { apiClient } from "@/lib/api-client";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorMessage } from "@/components/ErrorMessage";
import { ArrowRight, Lock } from "lucide-react";
import clsx from "clsx";
import { getAgeGroup, getThemeColors, AgeGroup } from "@/types";

interface Child {
  id: string;
  name: string;
  age: number;
  avatarUrl: string;
  points: number;
}

export default function ChildLoginPage() {
  const params = useParams();
  const router = useRouter();
  const [child, setChild] = useState<Child | null>(null);
  const [pin, setPin] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  if (!params) {
    return <div>Loading...</div>;
  }

  const subdomain = params.subdomain as string;
  const childId = params.childId as string;

  useEffect(() => {
    fetchChildInfo();
  }, [childId]);

  const fetchChildInfo = async () => {
    try {
      setError(null);
      const response = await apiClient.get(`/api/children/${childId}`);
      const childData = response.data.child;
      setChild({
        id: childData.id,
        name: childData.name,
        age: childData.age,
        avatarUrl: childData.avatarUrl,
        points: childData.points,
      });
    } catch (err: any) {
      console.error("Failed to fetch child info:", err);
      setError(err.message || "Failed to load child information.");
    } finally {
      setLoading(false);
    }
  };

  const handlePinChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newPin = [...pin];
    newPin[index] = value.slice(-1); // Only take the last character
    setPin(newPin);

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 4 digits are entered
    if (newPin.every((digit) => digit !== "") && index === 3) {
      setTimeout(() => handleSubmit(), 300);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").slice(0, 4);
    if (/^\d{4}$/.test(pasted)) {
      const newPin = pasted.split("");
      setPin(newPin);
      inputRefs.current[3]?.focus();
      setTimeout(() => handleSubmit(), 300);
    }
  };

  const handleSubmit = async () => {
    const pinString = pin.join("");
    if (pinString.length !== 4) {
      setError("Please enter a 4-digit PIN");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await apiClient.post("/api/auth/child-login", {
        subdomain,
        childId,
        pin: pinString,
      });

      // Store child session in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("childSession", JSON.stringify({
          child: response.data.child,
          tenant: response.data.tenant,
          timestamp: Date.now(),
        }));
      }

      // Redirect to child dashboard
      router.push(`/${subdomain}/child/${childId}`);
    } catch (err: any) {
      console.error("Child login failed:", err);
      setError(err.response?.data?.error || "Invalid PIN. Please try again.");
      setPin(["", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="md" color="primary" />
      </div>
    );
  }

  if (error && !child) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <ErrorMessage
          message={error}
          onRetry={fetchChildInfo}
          onDismiss={() => setError(null)}
        />
      </div>
    );
  }

  if (!child) {
    return null;
  }

  const ageGroup = getAgeGroup(child.age);
  const theme = getThemeColors(ageGroup);

  return (
    <div
      className={clsx(
        "min-h-screen flex flex-col items-center justify-center p-6 transition-colors duration-500",
        theme.bg
      )}
    >
      <button
        type="button"
        onClick={() => router.push(`/${subdomain}`)}
        className="absolute top-8 left-8 text-scandi-stone hover:text-scandi-chocolate flex items-center gap-2 font-bold bg-white px-4 py-2 rounded-full shadow-sm transition"
      >
        <ArrowRight className="rotate-180" /> Back
      </button>

      <div className="w-full max-w-md">
        <div className="bg-white rounded-[3rem] shadow-soft-lg border-4 border-white p-8 md:p-12 text-center">
          {/* Child Avatar */}
          <div className="mb-8">
            <div
              className={clsx(
                "w-32 h-32 mx-auto rounded-full p-3 border-4 shadow-soft-lg",
                ageGroup === AgeGroup.EARLY
                  ? "border-early-primary"
                  : ageGroup === AgeGroup.DISCOVERY
                  ? "border-disco-primary"
                  : "border-junior-primary"
              )}
            >
              <img
                src={child.avatarUrl}
                alt={child.name}
                className="w-full h-full rounded-full object-cover bg-scandi-cream"
              />
            </div>
            <h2 className="text-3xl font-kids font-bold text-scandi-chocolate mt-4">
              {child.name}
            </h2>
            <p className="text-scandi-stone font-medium mt-1">
              Enter your PIN to continue
            </p>
          </div>

          {/* PIN Input */}
          <div className="mb-8">
            <div className="flex justify-center gap-3 mb-4">
              {pin.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handlePinChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  disabled={submitting}
                  autoFocus={index === 0}
                  className={clsx(
                    "w-16 h-16 text-center text-3xl font-bold rounded-2xl border-4 transition-all",
                    digit
                      ? "bg-scandi-honey text-white border-scandi-honey shadow-toy"
                      : "bg-scandi-cream text-scandi-stone border-scandi-oat",
                    submitting && "opacity-50"
                  )}
                />
              ))}
            </div>
            <div className="flex items-center justify-center gap-2 text-scandi-stone text-sm">
              <Lock size={14} />
              <span>Your PIN is safe and secure</span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6">
              <ErrorMessage
                message={error}
                variant="inline"
                onDismiss={() => setError(null)}
              />
            </div>
          )}

          {/* Submit Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || pin.some((digit) => !digit)}
            className={clsx(
              "w-full py-5 rounded-full font-bold text-xl shadow-toy transition-all flex items-center justify-center gap-3",
              submitting || pin.some((digit) => !digit)
                ? "bg-scandi-stone text-white opacity-50"
                : "bg-scandi-moss text-white hover:bg-opacity-90 active:shadow-toy-active active:translate-y-[4px]"
            )}
          >
            {submitting ? (
              <>
                <LoadingSpinner size="sm" color="white" />
                Checking...
              </>
            ) : (
              "Enter"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

