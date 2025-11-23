"use client";

import React, { useState, useEffect, lazy, Suspense } from "react";
import {
  ChildProfile,
  AgeGroup,
  getAgeGroup,
  getThemeColors,
  GameModule,
  GameCategory,
} from "@/types";
import { Lock, ArrowRight, Settings, LogOut, Wand2, Brain, Sparkles, Trophy, Star } from "lucide-react";
import clsx from "clsx";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorMessage } from "@/components/ErrorMessage";
import { ChildSettingsModal } from "@/components/ChildSettingsModal";
import { apiClient } from "@/lib/api-client";

const OwlAssistant = lazy(() =>
  import("@/components/OwlAssistant").then((mod) => ({ default: mod.default }))
);

interface Props {
  child: ChildProfile;
  onSettings: () => void;
  onLogout: () => void;
  onNavigateToGame: (moduleId: string) => void;
  onNavigateToImageGenerator: () => void;
}

export default function ChildDashboard({
  child,
  onSettings,
  onLogout,
  onNavigateToGame,
  onNavigateToImageGenerator,
}: Props) {
  const [modules, setModules] = useState<GameModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [activeZone, setActiveZone] = useState<"cognitive" | "fun">("cognitive");

  const activeAgeGroup = getAgeGroup(child.age);
  const preferredThemeGroup = child.themePreference || activeAgeGroup;
  const theme = getThemeColors(preferredThemeGroup);

  useEffect(() => {
    fetchModules();
  }, [child.id]);

  const fetchModules = async () => {
    try {
      setError(null);
      const response = await apiClient.get(`/api/games/modules?childId=${child.id}`);
      setModules(response.data.modules || []);
    } catch (err: any) {
      console.error("Failed to fetch modules:", err);
      setError(err.message || "Failed to load games. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const cognitiveModules = modules.filter((m) => !m.locked);
  const funModules = []; // Fun games would be unlocked based on points/achievements

  const categoryIcons: Record<GameCategory, React.ReactNode> = {
    LOGIC: <Brain className="w-6 h-6" />,
    MATH: <Brain className="w-6 h-6" />,
    MEMORY: <Brain className="w-6 h-6" />,
    CREATIVITY: <Sparkles className="w-6 h-6" />,
    LANGUAGE: <Brain className="w-6 h-6" />,
  };

  const categoryColors: Record<GameCategory, string> = {
    LOGIC: "bg-scandi-sage/20 text-scandi-sage",
    MATH: "bg-scandi-denim/20 text-scandi-denim",
    MEMORY: "bg-scandi-clay/20 text-scandi-clay",
    CREATIVITY: "bg-scandi-honey/20 text-scandi-honey",
    LANGUAGE: "bg-scandi-lavender/20 text-scandi-lavender",
  };

  if (loading) {
    return (
      <div className={clsx("min-h-screen flex items-center justify-center", theme.bg)}>
        <LoadingSpinner size="md" color="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={clsx("min-h-screen flex items-center justify-center p-4", theme.bg)}>
        <ErrorMessage message={error} onRetry={fetchModules} />
      </div>
    );
  }

  return (
    <div
      className={clsx(
        "min-h-screen relative pb-32 transition-colors duration-500",
        theme.bg
      )}
    >
      {/* Header */}
      <header className="sticky top-0 z-40 px-6 py-4 flex justify-between items-center bg-white/60 backdrop-blur-sm border-b border-white/20">
        <div className="flex items-center gap-4">
          <img
            src={child.avatarUrl}
            className="w-14 h-14 rounded-full border-4 border-white shadow-sm bg-scandi-cream"
            alt="profile"
          />
          <div>
            <h1 className={clsx("font-bold text-2xl", theme.text)}>{child.name}</h1>
            <p className="text-sm text-scandi-stone">
              {activeAgeGroup === AgeGroup.EARLY
                ? "Early Play"
                : activeAgeGroup === AgeGroup.DISCOVERY
                ? "Discovery"
                : "Junior"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div
            className={clsx(
              "px-5 py-2 font-bold flex items-center gap-2 shadow-sm bg-white rounded-full",
              theme.text
            )}
          >
            <Star className="text-yellow-500" size={18} />
            {child.points}
          </div>
          <button
            type="button"
            onClick={() => setShowSettings(true)}
            className="p-3 bg-white text-scandi-stone hover:text-scandi-chocolate shadow-sm hover:shadow-md transition rounded-full"
            aria-label="Settings"
          >
            <Settings size={20} />
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="p-3 bg-white text-scandi-stone hover:text-scandi-clay shadow-sm hover:shadow-md transition rounded-full"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 md:p-10 space-y-8">
        {/* Zone Toggle */}
        <div className="flex gap-4 bg-white/60 backdrop-blur-sm p-2 rounded-full w-fit shadow-soft">
          <button
            onClick={() => setActiveZone("cognitive")}
            className={clsx(
              "px-6 py-3 rounded-full font-bold transition-all flex items-center gap-2",
              activeZone === "cognitive"
                ? "bg-scandi-moss text-white shadow-toy"
                : "text-scandi-stone hover:text-scandi-chocolate"
            )}
          >
            <Brain size={20} />
            Cognitive Zone
          </button>
          <button
            onClick={() => setActiveZone("fun")}
            className={clsx(
              "px-6 py-3 rounded-full font-bold transition-all flex items-center gap-2",
              activeZone === "fun"
                ? "bg-scandi-honey text-scandi-chocolate shadow-toy"
                : "text-scandi-stone hover:text-scandi-chocolate"
            )}
          >
            <Sparkles size={20} />
            Fun Zone
          </button>
        </div>

        {/* Cognitive Zone */}
        {activeZone === "cognitive" && (
          <div className="space-y-8 animate-fade-in">
            {/* Image Generator Card */}
            <div className="mb-8">
              <button
                type="button"
                onClick={onNavigateToImageGenerator}
                className="w-full bg-gradient-to-r from-scandi-honey/20 to-scandi-sage/20 p-8 rounded-[3rem] border-4 border-dashed border-scandi-honey/50 hover:border-scandi-honey transition-all shadow-soft hover:shadow-soft-lg group"
              >
                <div className="flex items-center justify-center gap-4">
                  <div className="w-16 h-16 bg-scandi-honey rounded-full flex items-center justify-center text-white shadow-toy group-hover:scale-110 transition-transform">
                    <Wand2 size={32} />
                  </div>
                  <div className="text-left">
                    <h3 className="text-2xl font-kids font-bold text-scandi-chocolate mb-1">
                      Magic Sticker Maker
                    </h3>
                    <p className="text-scandi-stone font-medium">
                      Create your own reward images!
                    </p>
                  </div>
                </div>
              </button>
            </div>

            {/* Game Modules Grid */}
            <div>
              <h2 className="text-3xl font-kids font-bold text-scandi-chocolate mb-6">
                Smart Games
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {cognitiveModules.map((module) => (
                  <button
                    type="button"
                    key={module.id}
                    onClick={() => onNavigateToGame(module.id)}
                    disabled={module.locked}
                    className={clsx(
                      "group relative bg-white p-6 text-left shadow-soft hover:shadow-soft-lg transition-all border-2 border-transparent hover:border-scandi-moss/30 flex flex-col justify-between overflow-hidden min-h-[240px] rounded-[3rem]",
                      module.locked ? "opacity-70 grayscale" : "hover:scale-105"
                    )}
                  >
                    {module.locked ? (
                      <div className="absolute inset-0 bg-white/60 backdrop-blur-sm -m-6 flex flex-col items-center justify-center z-20">
                        <Lock size={32} className="text-scandi-stone mb-2" />
                        <span className="font-bold text-scandi-stone">
                          Locked
                        </span>
                        <span className="text-xs text-scandi-stone mt-1">
                          Complete other games to unlock
                        </span>
                      </div>
                    ) : (
                      <>
                        <div>
                          <div
                            className={clsx(
                              "w-12 h-12 rounded-2xl flex items-center justify-center mb-4",
                              categoryColors[module.category]
                            )}
                          >
                            {categoryIcons[module.category]}
                          </div>
                          <h4 className="font-bold text-xl text-scandi-chocolate mb-2">
                            {module.title}
                          </h4>
                          <p className="text-scandi-stone text-sm font-medium mb-4">
                            {module.description}
                          </p>
                          <div className="flex items-center gap-2 mb-2">
                            <span
                              className={clsx(
                                "px-2 py-1 rounded-md text-xs font-bold",
                                module.difficulty === "Easy"
                                  ? "bg-green-100 text-green-700"
                                  : module.difficulty === "Medium"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                              )}
                            >
                              {module.difficulty}
                            </span>
                            <span className="text-xs text-scandi-stone">
                              {module.rewardPoints || 50} points
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-scandi-oat h-3 rounded-full overflow-hidden mt-4">
                          <div
                            className="bg-scandi-sage h-full rounded-full transition-all"
                            style={{ width: `${module.progress || 0}%` }}
                          />
                        </div>
                        <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                          <ArrowRight className="text-scandi-moss" size={24} />
                        </div>
                      </>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Fun Zone */}
        {activeZone === "fun" && (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center py-12">
              <Trophy className="mx-auto text-scandi-honey mb-4" size={64} />
              <h2 className="text-3xl font-kids font-bold text-scandi-chocolate mb-2">
                Fun Zone
              </h2>
              <p className="text-scandi-stone max-w-md mx-auto">
                Unlock fun games by earning points in Cognitive Zone! Keep playing
                smart games to unlock more fun activities.
              </p>
              <div className="mt-8 bg-white/60 backdrop-blur-sm p-6 rounded-[2rem] shadow-soft max-w-md mx-auto">
                <div className="flex items-center justify-center gap-4">
                  <div className="text-4xl font-bold text-scandi-honey">
                    {child.points}
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-scandi-chocolate">Points Earned</p>
                    <p className="text-sm text-scandi-stone">
                      {500 - child.points} more to unlock next game
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Locked Fun Games Preview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 opacity-50">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white p-6 rounded-[3rem] shadow-soft border-2 border-dashed border-scandi-oat min-h-[240px] flex flex-col items-center justify-center"
                >
                  <Lock className="text-scandi-stone mb-4" size={48} />
                  <p className="text-scandi-stone font-bold">Coming Soon</p>
                  <p className="text-xs text-scandi-stone mt-2">
                    Unlock with {500 * i} points
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Owl Assistant */}
      <Suspense fallback={null}>
        <OwlAssistant
          ageGroup={activeAgeGroup}
          forcedVariant={child.buddy}
        />
      </Suspense>

      {/* Settings Modal */}
      {child && (
        <ChildSettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          child={child}
          onUpdate={(updatedChild) => {
            // Update would be handled by parent component
            setShowSettings(false);
          }}
        />
      )}
    </div>
  );
}

