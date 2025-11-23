import React, { useState, useEffect } from "react";
import {
  ArrowRight,
  Check,
  Globe,
  Sparkles,
  Brain,
  ChevronLeft,
  Star,
  Plus,
  Trash2,
  Home,
  Loader2,
  Lock,
} from "lucide-react";
import { AgeGroup, getAgeGroup, ChildProfile } from "../types";
import clsx from "clsx";
import { apiClient } from "../lib/api-client";
import { ErrorMessage } from "./ErrorMessage";
import { LoadingSpinner } from "./LoadingSpinner";

interface OnboardingFlowProps {
  onComplete: (data: { familyName: string; subdomain: string; children: ChildProfile[]; user: any; tenant: any; accessToken: string; refreshToken: string }) => void;
  onCancel: () => void;
}

const AVATAR_SEEDS = [
  "Felix",
  "Aneka",
  "Zoe",
  "Max",
  "Luna",
  "Leo",
  "Ivy",
  "Kai",
];

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  onComplete,
  onCancel,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [animating, setAnimating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [parentName, setParentName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [children, setChildren] = useState<
    { name: string; age: number; avatar: string; pin: string }[]
  >([{ name: "", age: 5, avatar: AVATAR_SEEDS[0], pin: "" }]);

  // Auto-generate subdomain from family name
  useEffect(() => {
    if (familyName && !subdomain) {
      const generated = familyName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
      
      if (generated) {
        setSubdomain(generated + "-family");
      }
    }
  }, [familyName, subdomain]);

  const nextStep = () => {
    setAnimating(true);
    setTimeout(() => {
      setCurrentStep((prev) => prev + 1);
      setAnimating(false);
    }, 300);
  };

  const prevStep = () => {
    if (currentStep === 1) return onCancel();
    setAnimating(true);
    setTimeout(() => {
      setCurrentStep((prev) => prev - 1);
      setAnimating(false);
    }, 300);
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    setError(null);

    // Validation before submission
    if (!parentName || parentName.trim().length < 2) {
      setError("Parent name must be at least 2 characters");
      setIsSubmitting(false);
      return;
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      setIsSubmitting(false);
      return;
    }

    if (!password || password.length < 8) {
      setError("Password must be at least 8 characters");
      setIsSubmitting(false);
      return;
    }

    if (!familyName || familyName.trim().length < 2) {
      setError("Family name must be at least 2 characters");
      setIsSubmitting(false);
      return;
    }

    // Clean and validate subdomain
    let cleanSubdomain = subdomain
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    // If subdomain is empty or too short, generate from family name
    if (!cleanSubdomain || cleanSubdomain.length < 2) {
      cleanSubdomain = familyName
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
      
      if (cleanSubdomain) {
        cleanSubdomain = cleanSubdomain + "-family";
      } else {
        setError("Subdomain must be at least 2 characters");
        setIsSubmitting(false);
        return;
      }
    }

    // Final validation - must match regex
    if (!/^[a-z0-9-]+$/.test(cleanSubdomain)) {
      setError("Subdomain can only contain lowercase letters, numbers, and hyphens");
      setIsSubmitting(false);
      return;
    }

    if (cleanSubdomain.length < 2) {
      setError("Subdomain must be at least 2 characters");
      setIsSubmitting(false);
      return;
    }

    // Validate children
    const validChildren = children.filter((child) => {
      const nameValid = child.name && child.name.trim().length > 0;
      const ageValid = child.age && typeof child.age === 'number' && child.age > 0 && child.age <= 13;
      const pinValid = child.pin && child.pin.length === 4 && /^\d{4}$/.test(child.pin);
      return nameValid && ageValid && pinValid;
    });

    if (validChildren.length === 0) {
      setError("Please add at least one child with valid information:\n- Name (required)\n- Age (1-13)\n- PIN (4 digits)");
      setIsSubmitting(false);
      return;
    }

    try {
      // Step 1: Register user and create family
      const registerData = {
        email: email.trim(),
        password,
        name: parentName.trim(),
        familyName: familyName.trim(),
        subdomain: cleanSubdomain,
      };
      
      console.log("Registering with data:", {
        ...registerData,
        password: "***", // Don't log password
      });
      
      const registerResponse = await apiClient.post("/api/auth/register", registerData);

      const { user, tenant, family, accessToken, refreshToken } =
        registerResponse.data;

      // Save tokens to localStorage IMMEDIATELY after registration
      // This is required for subsequent API calls to include authentication
      if (typeof window !== "undefined") {
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
      }

      // Step 2: Create children (only valid ones)
      // Explicitly set Authorization header to ensure token is included
      const childrenPromises = validChildren.map((child) =>
        apiClient.post(
          "/api/children",
          {
            familyId: family.id,
            name: child.name.trim(),
            age: Number(child.age),
            pin: child.pin,
            avatarUrl: `https://api.dicebear.com/9.x/avataaars/svg?seed=${child.avatar}`,
            buddy: getAgeGroup(child.age),
            preferredDifficulty:
              child.age <= 4 ? "Easy" : child.age <= 8 ? "Medium" : "Hard",
            themePreference: getAgeGroup(child.age),
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        )
      );

      const childrenResponses = await Promise.all(childrenPromises);
      const createdChildren = childrenResponses.map((res) => res.data.child);

      // Format children data for the App
      const formattedChildren: ChildProfile[] = createdChildren.map(
        (child) => ({
          id: child.id,
          name: child.name,
          age: child.age,
          points: child.points || 0,
          avatarUrl: child.avatarUrl,
          buddy: child.buddy,
          preferredDifficulty: child.preferredDifficulty,
          themePreference: child.themePreference,
        })
      );

      // Call onComplete with the data
      onComplete({
        familyName,
        subdomain,
        children: formattedChildren,
        user,
        tenant,
        accessToken,
        refreshToken,
      });
      
      // Reset submitting state after successful completion
      setIsSubmitting(false);
    } catch (err: any) {
      console.error("Onboarding error:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error details:", err.response?.data?.details);
      
      // If user already exists, try to log them in automatically
      if (err.response?.data?.error === "User already exists") {
        try {
          console.log("User already exists, attempting automatic login...");
          const loginResponse = await apiClient.post("/api/auth/login", {
            email: email.trim(),
            password,
          });

          const { user: loginUser, tenant: loginTenant, accessToken: loginAccessToken, refreshToken: loginRefreshToken } = loginResponse.data;

          // Save tokens
          if (typeof window !== "undefined") {
            localStorage.setItem("accessToken", loginAccessToken);
            localStorage.setItem("refreshToken", loginRefreshToken);
          }

          // Get existing children for this family
          const childrenResponse = await apiClient.get("/api/children", {
            headers: {
              Authorization: `Bearer ${loginAccessToken}`,
            },
          });

          const existingChildren = childrenResponse.data.children || [];

          // Format children data
          const formattedChildren: ChildProfile[] = existingChildren.map(
            (child: any) => ({
              id: child.id,
              name: child.name,
              age: child.age,
              points: child.points || 0,
              avatarUrl: child.avatarUrl,
              buddy: child.buddy,
              preferredDifficulty: child.preferredDifficulty,
              themePreference: child.themePreference,
            })
          );

          // Call onComplete with login data
          onComplete({
            familyName: loginTenant.name,
            subdomain: loginTenant.subdomain,
            children: formattedChildren,
            user: loginUser,
            tenant: loginTenant,
            accessToken: loginAccessToken,
            refreshToken: loginRefreshToken,
          });

          setIsSubmitting(false);
          return; // Exit early on successful login
        } catch (loginErr: any) {
          // Login failed - show error message
          console.error("Automatic login failed:", loginErr);
          setError(
            "An account with this email already exists, but the password is incorrect. Please check your password or use a different email."
          );
          setIsSubmitting(false);
          return;
        }
      }
      
      // Better error messages for other errors
      let errorMessage = "Failed to complete registration. Please try again.";
      
      if (err.response?.data) {
        const data = err.response.data;
        
        if (data.details && Array.isArray(data.details) && data.details.length > 0) {
          // Zod validation errors - show all errors
          const errorMessages = data.details.map((detail: any) => {
            const field = detail.path?.join(".") || "field";
            return `${field}: ${detail.message || "Invalid value"}`;
          });
          errorMessage = errorMessages.join(", ");
        } else if (data.error) {
          errorMessage = data.error;
          // If it's a specific error like "Subdomain already taken"
          if (data.error === "Subdomain already taken") {
            errorMessage = "This web address is already taken. Please choose a different one.";
          }
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setIsSubmitting(false);
    }
  };

  // --- Step 1: Welcome ---
  const renderWelcome = () => (
    <div className="text-center space-y-6 max-w-lg mx-auto">
      <div className="w-32 h-32 bg-scandi-honey/20 rounded-full mx-auto flex items-center justify-center mb-6 animate-float">
        <Home className="w-16 h-16 text-scandi-honey" />
      </div>
      <h2 className="text-4xl font-bold text-scandi-chocolate font-kids">
        Welcome to BrainPlay
      </h2>
      <p className="text-lg text-scandi-stone leading-relaxed font-medium">
        Let's build a safe, digital nest for your little ones. A private space
        for learning, playing, and growing.
      </p>
      <div className="pt-8">
        <button
          onClick={nextStep}
          className="w-full py-4 bg-scandi-clay hover:bg-opacity-90 text-white rounded-full font-bold text-lg shadow-toy active:shadow-toy-active active:translate-y-[4px] transition"
        >
          Start Building
        </button>
      </div>
    </div>
  );

  // --- Step 2: Parent Account ---
  const renderAccount = () => (
    <div className="max-w-md mx-auto space-y-8">
      <div className="text-center mb-4">
        <h2 className="text-3xl font-bold text-scandi-chocolate font-kids">
          Parent Profile
        </h2>
        <p className="text-scandi-stone mt-2">
          First, who is the guardian of this nest?
        </p>
      </div>

      <div className="space-y-6 bg-white p-8 rounded-[2rem] shadow-soft border border-scandi-oat">
        <div>
          <label className="block text-sm font-bold text-scandi-stone mb-2">
            Your Name
          </label>
          <input
            type="text"
            value={parentName}
            onChange={(e) => setParentName(e.target.value)}
            className="w-full px-4 py-3 bg-scandi-cream border-2 border-transparent focus:border-scandi-honey rounded-xl outline-none font-bold text-scandi-chocolate transition"
            placeholder="e.g. Sarah Smith"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-scandi-stone mb-2">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-scandi-cream border-2 border-transparent focus:border-scandi-honey rounded-xl outline-none font-bold text-scandi-chocolate transition"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-scandi-stone mb-2">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-scandi-cream border-2 border-transparent focus:border-scandi-honey rounded-xl outline-none font-bold text-scandi-chocolate transition"
            placeholder="••••••••"
            minLength={8}
          />
        </div>
      </div>

      <button
        onClick={nextStep}
        disabled={!parentName || !email || !password || password.length < 8}
        className="w-full py-4 bg-scandi-moss hover:bg-opacity-90 text-white rounded-full font-bold disabled:opacity-50 disabled:shadow-none shadow-toy active:shadow-toy-active active:translate-y-[4px] transition"
      >
        Continue
      </button>
    </div>
  );

  // --- Step 3: Family Space ---
  const renderFamilySpace = () => {
    return (
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-scandi-chocolate font-kids">
            Name Your Space
          </h2>
          <p className="text-scandi-stone mt-2">
            Where your family will live online.
          </p>
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-soft border border-scandi-oat space-y-6">
          <div>
            <label className="block text-sm font-bold text-scandi-stone mb-2">
              Family Name
            </label>
            <input
              type="text"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              className="w-full px-4 py-3 bg-scandi-cream border-2 border-transparent focus:border-scandi-honey rounded-xl outline-none font-bold text-scandi-chocolate transition text-lg"
              placeholder="The Robinsons"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-scandi-stone mb-2">
              Web Address
            </label>
            <div className="flex items-center bg-scandi-cream rounded-xl px-4 py-3 border-2 border-transparent focus-within:border-scandi-honey transition">
              <Globe className="text-scandi-sage w-5 h-5 mr-3" />
              <input
                type="text"
                value={subdomain}
                onChange={(e) =>
                  setSubdomain(
                    e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")
                  )
                }
                className="flex-1 bg-transparent outline-none font-bold text-scandi-moss"
              />
              <span className="text-scandi-stone text-sm font-medium ml-2 hidden sm:inline">
                .brainplaykids.com
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={nextStep}
          disabled={!subdomain}
          className="w-full py-4 bg-scandi-moss hover:bg-opacity-90 text-white rounded-full font-bold disabled:opacity-50 shadow-toy active:shadow-toy-active active:translate-y-[4px] transition"
        >
          Create Space
        </button>
      </div>
    );
  };

  // --- Step 4: Children ---
  const renderChildren = () => {
    const addChild = () => {
      setChildren([
        ...children,
        {
          name: "",
          age: 5,
          avatar: AVATAR_SEEDS[Math.floor(Math.random() * AVATAR_SEEDS.length)],
          pin: "",
        },
      ]);
    };

    const updateChild = (index: number, field: string, value: any) => {
      const newChildren = [...children];
      newChildren[index] = { ...newChildren[index], [field]: value };
      setChildren(newChildren);
    };

    const removeChild = (index: number) => {
      setChildren(children.filter((_, i) => i !== index));
    };

    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-scandi-chocolate font-kids">
            Who is playing?
          </h2>
          <p className="text-scandi-stone mt-2 max-w-lg mx-auto leading-relaxed">
            Add your children below. BrainPlay automatically transforms the
            interface, game difficulty, and Owl's personality to match their age
            stage.
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

        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {children.map((child, idx) => {
            const ageGroup = getAgeGroup(child.age || 0);
            return (
              <div
                key={idx}
                className="bg-white p-6 rounded-[2rem] shadow-soft border border-scandi-oat relative group transition hover:shadow-soft-lg"
              >
                <div className="flex flex-col md:flex-row gap-6 items-center">
                  {/* Avatar */}
                  <button
                    onClick={() =>
                      updateChild(
                        idx,
                        "avatar",
                        AVATAR_SEEDS[
                          Math.floor(Math.random() * AVATAR_SEEDS.length)
                        ] + Math.random()
                      )
                    }
                    className="relative w-24 h-24 rounded-full bg-scandi-cream border-4 border-white shadow-sm overflow-hidden hover:scale-105 transition"
                  >
                    <img
                      src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${child.avatar}`}
                      alt="avatar"
                    />
                    <div className="absolute inset-0 bg-black/10 opacity-0 hover:opacity-100 flex items-center justify-center text-white text-xs font-bold">
                      Change
                    </div>
                  </button>

                  {/* Inputs */}
                  <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-6">
                      <label className="text-xs font-bold text-scandi-stone uppercase tracking-wider mb-1 block">
                        Name *
                      </label>
                      <input
                        type="text"
                        value={child.name}
                        onChange={(e) => {
                          updateChild(idx, "name", e.target.value);
                          setError(null); // Clear error when user types
                        }}
                        className="w-full p-3 bg-scandi-cream rounded-xl outline-none font-bold text-scandi-chocolate border-2 border-transparent focus:border-scandi-honey transition"
                        placeholder="Child's name"
                        required
                      />
                    </div>

                    <div className="md:col-span-3">
                      <label className="text-xs font-bold text-scandi-stone uppercase tracking-wider mb-1 block">
                        Age *
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="13"
                        value={child.age || ""}
                        onChange={(e) => {
                          const value = e.target.value === "" ? 0 : parseInt(e.target.value);
                          updateChild(idx, "age", isNaN(value) ? 0 : Math.max(1, Math.min(13, value)));
                          setError(null); // Clear error when user types
                        }}
                        className="w-full p-3 bg-scandi-cream rounded-xl outline-none font-bold text-scandi-chocolate border-2 border-transparent focus:border-scandi-honey transition"
                        placeholder="1-13"
                        required
                      />
                    </div>

                    <div className="md:col-span-3">
                      <label className="text-xs font-bold text-scandi-stone uppercase tracking-wider mb-1 flex items-center gap-1">
                        PIN * <Lock size={10} />
                      </label>
                      <input
                        type="password"
                        maxLength={4}
                        value={child.pin}
                        onChange={(e) => {
                          updateChild(
                            idx,
                            "pin",
                            e.target.value.replace(/[^0-9]/g, "")
                          );
                          setError(null); // Clear error when user types
                        }}
                        className="w-full p-3 bg-scandi-cream rounded-xl outline-none font-bold text-scandi-chocolate tracking-widest text-center border-2 border-transparent focus:border-scandi-honey transition"
                        placeholder="0000"
                        inputMode="numeric"
                        required
                      />
                    </div>
                  </div>
                </div>

                {child.age > 0 && (
                  <div className="mt-4 pt-4 border-t border-scandi-oat">
                    <div className="flex justify-between items-start">
                      <div>
                        <div
                          className={clsx(
                            "px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 w-fit mb-1",
                            ageGroup === AgeGroup.EARLY
                              ? "bg-scandi-honey/20 text-scandi-chocolate"
                              : ageGroup === AgeGroup.DISCOVERY
                              ? "bg-scandi-sage/20 text-scandi-moss"
                              : "bg-scandi-denim/20 text-scandi-denim"
                          )}
                        >
                          <Star size={12} fill="currentColor" />
                          {ageGroup === AgeGroup.EARLY
                            ? "Early Play (Ages 0-4)"
                            : ageGroup === AgeGroup.DISCOVERY
                            ? "Discovery (Ages 5-8)"
                            : "Junior Brain (Ages 9-13)"}
                        </div>
                        <p className="text-xs text-scandi-stone font-medium ml-1">
                          {ageGroup === AgeGroup.EARLY
                            ? "Big buttons, gentle voice, simple words."
                            : ageGroup === AgeGroup.DISCOVERY
                            ? "Fun quests, encouraging friend, active learning."
                            : "Sleek tech UI, mentor persona, logic challenges."}
                        </p>
                      </div>

                      {children.length > 1 && (
                        <button
                          onClick={() => removeChild(idx)}
                          className="text-scandi-stone hover:text-red-400 p-2"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <button
          onClick={addChild}
          className="w-full py-3 mt-4 border-2 border-dashed border-scandi-stone/30 rounded-2xl text-scandi-stone font-bold hover:border-scandi-sage hover:text-scandi-sage transition flex items-center justify-center gap-2"
        >
          <Plus size={20} /> Add Another Child
        </button>

        <button
          onClick={() => {
            // Validate at least one child before proceeding
            const hasValidChild = children.some((child) => {
              const nameValid = child.name && child.name.trim().length > 0;
              const ageValid = child.age && typeof child.age === 'number' && child.age > 0 && child.age <= 13;
              const pinValid = child.pin && child.pin.length === 4 && /^\d{4}$/.test(child.pin);
              return nameValid && ageValid && pinValid;
            });

            if (!hasValidChild) {
              setError("Please add at least one child with:\n- Name (required)\n- Age (1-13)\n- PIN (4 digits)");
              return;
            }
            setError(null);
            nextStep();
          }}
          className="w-full py-4 mt-8 bg-scandi-moss hover:bg-opacity-90 text-white rounded-full font-bold shadow-toy active:shadow-toy-active active:translate-y-[4px] transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next Step
        </button>
      </div>
    );
  };

  // --- Step 5: How it Works ---
  const renderTutorial = () => (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-scandi-chocolate font-kids mb-2">
          Philosophy
        </h2>
        <p className="text-scandi-stone">Gentle learning, meaningful play.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            icon: Brain,
            color: "text-scandi-denim",
            bg: "bg-scandi-denim/10",
            title: "Smart Growth",
            desc: "Tasks adapt to their developmental stage.",
          },
          {
            icon: Sparkles,
            color: "text-scandi-honey",
            bg: "bg-scandi-honey/10",
            title: "Kind AI",
            desc: "A supportive, gentle voice guide.",
          },
          {
            icon: Star,
            color: "text-scandi-clay",
            bg: "bg-scandi-clay/10",
            title: "Calm Rewards",
            desc: "Fun that does not overstimulate.",
          },
        ].map((item, i) => (
          <div
            key={i}
            className="bg-white p-8 rounded-[2rem] shadow-soft border border-scandi-oat text-center hover:-translate-y-2 transition-transform duration-300"
          >
            <div
              className={`w-16 h-16 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}
            >
              <item.icon size={32} />
            </div>
            <h3 className="font-bold text-lg mb-2 text-scandi-chocolate">
              {item.title}
            </h3>
            <p className="text-scandi-stone text-sm leading-relaxed">
              {item.desc}
            </p>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-12">
        <button
          onClick={nextStep}
          className="px-12 py-4 bg-scandi-moss hover:bg-opacity-90 text-white rounded-full font-bold text-lg shadow-toy active:shadow-toy-active active:translate-y-[4px] flex items-center gap-2 transition"
        >
          I'm Ready <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );

  // --- Step 6: Ready ---
  const renderReady = () => (
    <div className="max-w-lg mx-auto text-center space-y-8 animate-fade-in">
      <div className="w-24 h-24 bg-scandi-sage/20 rounded-full mx-auto flex items-center justify-center mb-6">
        <Check className="w-12 h-12 text-scandi-moss" />
      </div>

      <div>
        <h2 className="text-3xl font-bold text-scandi-chocolate font-kids mb-2">
          All Warm & Cozy!
        </h2>
        <p className="text-scandi-stone">
          Your family space is ready for move-in.
        </p>
      </div>

      <div className="bg-white p-8 rounded-[2rem] border border-scandi-oat text-left space-y-4 shadow-soft">
        <div className="flex justify-between items-center border-b border-scandi-oat pb-3">
          <span className="text-scandi-stone text-sm font-medium">Link</span>
          <span className="font-bold text-scandi-moss">
            {subdomain || "smith-family"}.brainplaykids.com
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-scandi-stone text-sm font-medium">Plan</span>
          <span className="bg-scandi-honey/20 text-scandi-chocolate px-3 py-1 rounded-full text-xs font-bold">
            PRO TRIAL
          </span>
        </div>
      </div>

      {error && (
        <ErrorMessage
          message={error}
          onDismiss={() => setError(null)}
          variant="inline"
        />
      )}

      <button
        onClick={handleFinish}
        disabled={isSubmitting}
        className="w-full py-4 bg-scandi-chocolate hover:bg-opacity-90 text-white rounded-full font-bold text-lg shadow-toy active:shadow-toy-active active:translate-y-[4px] transition flex items-center justify-center gap-3 disabled:opacity-50"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="animate-spin" /> Setting up Space...
          </>
        ) : (
          "Go to Parent Dashboard"
        )}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-scandi-cream flex flex-col font-sans text-scandi-chocolate">
      {/* Header */}
      <header className="px-8 py-6 flex items-center justify-between">
        <button
          onClick={prevStep}
          className="p-2 hover:bg-scandi-oat rounded-full transition text-scandi-stone"
        >
          {currentStep > 1 && <ChevronLeft />}
        </button>

        {/* Progress Dots */}
        {currentStep > 1 && currentStep < 6 && (
          <div className="flex gap-2">
            {[2, 3, 4, 5].map((step) => (
              <div
                key={step}
                className={`w-3 h-3 rounded-full transition-colors ${
                  step <= currentStep ? "bg-scandi-clay" : "bg-scandi-oat"
                }`}
              ></div>
            ))}
          </div>
        )}

        <div className="w-8"></div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col justify-center px-4 pb-20">
        <div
          className={clsx(
            "transition-all duration-500 ease-out",
            animating ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
          )}
        >
          {currentStep === 1 && renderWelcome()}
          {currentStep === 2 && renderAccount()}
          {currentStep === 3 && renderFamilySpace()}
          {currentStep === 4 && renderChildren()}
          {currentStep === 5 && renderTutorial()}
          {currentStep === 6 && renderReady()}
        </div>
      </main>
    </div>
  );
};

export default OnboardingFlow;
