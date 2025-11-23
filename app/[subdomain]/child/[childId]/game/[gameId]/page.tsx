"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import {
  ChildProfile,
  AgeGroup,
  getAgeGroup,
  getThemeColors,
  SmartGame as SmartGameType,
} from "@/types";
import SmartGame from "@/components/SmartGame";
import OwlAssistant from "@/components/OwlAssistant";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorMessage } from "@/components/ErrorMessage";
import { ArrowRight } from "lucide-react";
import clsx from "clsx";

export default function GameSessionPage() {
  const params = useParams();
  const router = useRouter();
  const [child, setChild] = useState<ChildProfile | null>(null);
  const [gameModule, setGameModule] = useState<any>(null);
  const [game, setGame] = useState<SmartGameType | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);

  const childId = params.childId as string;
  const gameId = params.gameId as string; // This is gameModuleId
  const subdomain = params.subdomain as string;

  useEffect(() => {
    initializeSession();
  }, [childId, gameId]);

  const initializeSession = async () => {
    try {
      setLoading(true);
      setError(null);

      // Step 1: Load child and game module data
      const [childRes, moduleRes] = await Promise.all([
        apiClient.get(`/api/children/${childId}`),
        apiClient.get(`/api/games/modules?childId=${childId}`),
      ]);

      const childData = childRes.data.child;
      const modules = moduleRes.data.modules || [];
      const module = modules.find((m: any) => m.id === gameId);

      if (!module) {
        setError("Game module not found");
        return;
      }

      setChild(childData);
      setGameModule(module);

      // Step 2: Generate question
      const questionRes = await apiClient.post("/api/games/generate-question", {
        gameModuleId: gameId,
        childId: childId,
      });

      const { question, correctAnswer } = questionRes.data;

      // Step 3: Create session
      const sessionRes = await apiClient.post("/api/games/sessions", {
        childId: childId,
        gameModuleId: gameId,
        question,
        correctAnswer,
      });

      const session = sessionRes.data.session;
      setSessionId(session.id);

      // Step 4: Create game object for SmartGame component
      const gameData: SmartGameType = {
        id: session.id,
        title: module.title,
        description: module.description,
        question,
        correctAnswer,
        difficulty: module.difficulty,
        rewardPoints: module.rewardPoints || 50,
      };

      setGame(gameData);
    } catch (err: any) {
      console.error("Failed to initialize game session:", err);
      setError(err.message || "Failed to start game session");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async (answer: string): Promise<boolean> => {
    if (!sessionId) return false;

    try {
      // Step 5: Submit answer via API
      const response = await apiClient.post(
        `/api/games/sessions/${sessionId}/answer`,
        {
          answer,
        }
      );
      return response.data.isCorrect;
    } catch (err: any) {
      console.error("Failed to submit answer:", err);
      // Fallback to quick check if API fails
      const { checkAnswerQuickly } = await import("@/services/geminiService");
      return await checkAnswerQuickly(game?.question || "", answer);
    }
  };

  const handleGameComplete = async (points: number) => {
    if (!sessionId) return;

    try {
      setIsCompleting(true);

      // Step 6: Complete session (this will award points and update progress)
      await apiClient.post(`/api/games/sessions/${sessionId}/complete`);

      // Step 7: Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push(`/${subdomain}/child/${childId}`);
      }, 1500);
    } catch (err: any) {
      console.error("Failed to complete session:", err);
      // Still redirect even if complete fails
      setTimeout(() => {
        router.push(`/${subdomain}/child/${childId}`);
      }, 1500);
    } finally {
      setIsCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-scandi-cream">
        <div className="text-center">
          <LoadingSpinner size="lg" color="primary" />
          <p className="mt-4 text-scandi-stone font-medium">
            Starting your game...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-scandi-cream p-4">
        <ErrorMessage
          message={error}
          onRetry={initializeSession}
          onDismiss={() => router.push(`/${subdomain}/child/${childId}`)}
        />
      </div>
    );
  }

  if (!child || !game) {
    return null;
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
          onClick={() => router.push(`/${subdomain}/child/${childId}`)}
          className="font-bold flex items-center gap-2 text-scandi-stone hover:text-scandi-chocolate bg-white px-4 py-2 rounded-full shadow-sm"
        >
          <ArrowRight className="rotate-180" /> Back to Dashboard
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center pb-20 px-4">
        {isCompleting ? (
          <div className="text-center">
            <LoadingSpinner size="lg" color="primary" />
            <p className="mt-4 text-scandi-stone font-medium">
              Completing your game...
            </p>
          </div>
        ) : (
          <SmartGame
            game={game}
            ageGroup={activeAgeGroup}
            onComplete={handleGameComplete}
            onSubmitAnswer={handleSubmitAnswer}
          />
        )}
      </div>

      <OwlAssistant ageGroup={activeAgeGroup} forcedVariant={child.buddy} />
    </div>
  );
}
