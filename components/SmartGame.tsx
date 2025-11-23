import React, { useState } from "react";
import { checkAnswerQuickly } from "../services/geminiService";
import {
  Check,
  X,
  Star,
  ArrowRight,
  Zap,
  Trophy,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import { SmartGame as SmartGameType, AgeGroup } from "../types";
import { LoadingSpinner } from "./LoadingSpinner";
import { ErrorMessage } from "./ErrorMessage";
import clsx from "clsx";

interface Props {
  game: SmartGameType;
  ageGroup: AgeGroup;
  onComplete: (points: number) => void;
  onSubmitAnswer?: (answer: string) => Promise<boolean>;
}

// Tooltip Helper Component
const GameTooltip: React.FC<{
  content: string;
  children: React.ReactNode;
  ageGroup: AgeGroup;
}> = ({ content, children, ageGroup }) => {
  const [show, setShow] = useState(false);

  return (
    <div
      className="relative inline-block w-full"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div
          className={clsx(
            "absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-xl text-white text-center font-bold shadow-lg z-20 w-48 pointer-events-none animate-fade-in",
            ageGroup === AgeGroup.EARLY
              ? "bg-early-secondary text-lg"
              : ageGroup === AgeGroup.DISCOVERY
              ? "bg-disco-text text-sm"
              : "bg-junior-text text-xs font-mono"
          )}
        >
          {content}
          <div
            className={clsx(
              "absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-8 border-transparent border-t-current",
              ageGroup === AgeGroup.EARLY
                ? "text-early-secondary"
                : ageGroup === AgeGroup.DISCOVERY
                ? "text-disco-text"
                : "text-junior-text"
            )}
          ></div>
        </div>
      )}
    </div>
  );
};

const SmartGame: React.FC<Props> = ({
  game,
  ageGroup,
  onComplete,
  onSubmitAnswer,
}) => {
  const [answer, setAnswer] = useState("");
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<"correct" | "incorrect" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer) return;

    setChecking(true);
    setError(null);

    try {
      // If onSubmitAnswer callback is provided, use it; otherwise use checkAnswerQuickly
      let isCorrect: boolean;
      if (onSubmitAnswer) {
        isCorrect = await onSubmitAnswer(answer);
      } else {
        isCorrect = await checkAnswerQuickly(game.question, answer);
      }

      if (isCorrect) {
        setResult("correct");
        const sound = new Audio(
          "https://codeskulptor-demos.commondatastorage.googleapis.com/GalaxyInvaders/bonus.wav"
        );
        sound.volume = 0.2;
        sound.play().catch(() => {});
        // Use rewardPoints from game module if available, otherwise default to 100
        const points = game.rewardPoints || 100;
        setTimeout(() => {
          setChecking(false);
          onComplete(points);
        }, 2000);
      } else {
        setResult("incorrect");
        setTimeout(() => {
          setResult(null);
          setChecking(false);
        }, 2000);
      }
    } catch (err: any) {
      console.error("Failed to submit answer:", err);
      setError(err.message || "Failed to submit answer. Please try again.");
      setChecking(false);
    } finally {
      setChecking(false);
    }
  };

  // --- Age Tier Styles ---

  // Early (0-4): Soft, tactile, big buttons, icons over text
  if (ageGroup === AgeGroup.EARLY) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-[#FFFDF5] rounded-[3rem] border-8 border-dashed border-early-primary p-8 md:p-12 shadow-soft-lg relative overflow-hidden">
          {/* Decorative background blobs */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-early-primary/10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-early-secondary/10 rounded-full translate-x-1/3 translate-y-1/3"></div>

          <div className="relative z-10 flex flex-col items-center text-center">
            <div
              className={`mb-6 transition-transform duration-500 ${
                result === "correct" ? "scale-125 rotate-12" : ""
              }`}
            >
              {result === "correct" ? (
                <div className="w-24 h-24 bg-early-primary rounded-full flex items-center justify-center animate-bounce shadow-toy">
                  <Star size={48} className="text-white fill-white" />
                </div>
              ) : (
                <div className="w-20 h-20 bg-early-bg border-4 border-early-primary rounded-full flex items-center justify-center text-early-text shadow-sm">
                  <Sparkles size={32} />
                </div>
              )}
            </div>

            <h2 className="text-5xl font-kids font-bold text-early-text mb-8 leading-tight">
              {game.question}
            </h2>

            <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6">
              <GameTooltip
                content="Tap here and use your keyboard!"
                ageGroup={ageGroup}
              >
                <input
                  type="text"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="?"
                  className="w-full h-32 text-center text-6xl font-kids text-early-text bg-white border-4 border-early-secondary/30 rounded-3xl outline-none focus:border-early-primary transition-all placeholder:text-early-accent/50 shadow-inner"
                  autoFocus
                  inputMode="numeric"
                />
              </GameTooltip>

              <GameTooltip
                content="Tap to check your answer!"
                ageGroup={ageGroup}
              >
                <button
                  disabled={checking}
                  className={`w-full py-6 rounded-full text-3xl font-kids font-bold text-white shadow-toy active:shadow-toy-active active:translate-y-[4px] transition-all flex items-center justify-center gap-3 ${
                    result === "correct"
                      ? "bg-green-400"
                      : result === "incorrect"
                      ? "bg-early-secondary"
                      : "bg-early-primary hover:bg-yellow-400"
                  }`}
                >
                  {checking ? (
                    <LoadingSpinner size="lg" color="white" />
                  ) : result === "correct" ? (
                    "Yay! Good Job!"
                  ) : result === "incorrect" ? (
                    "Uh oh, Try Again!"
                  ) : (
                    "Go!"
                  )}
                </button>
              </GameTooltip>
            </form>
            {error && (
              <div className="mt-4">
                <ErrorMessage
                  message={error}
                  onDismiss={() => setError(null)}
                  variant="inline"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Junior (9-13): Sleek, minimal, tech/game UI, glassmorphism
  if (ageGroup === AgeGroup.JUNIOR) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-junior-accent/30 shadow-2xl relative overflow-hidden">
          {/* Status Bar */}
          <div className="h-10 bg-junior-text/5 border-b border-junior-accent/20 flex items-center px-4 justify-between">
            <span className="text-xs font-mono font-bold text-junior-secondary uppercase tracking-widest flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              System: Active
            </span>
            <span className="text-xs font-mono font-bold text-junior-accent">
              ID: {game.id.toUpperCase()}
            </span>
          </div>

          <div className="p-10 md:p-16 relative">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <Zap size={120} />
            </div>

            <div className="relative z-10">
              <div className="mb-2 text-junior-secondary font-mono text-sm font-bold uppercase tracking-wider">
                Objective: Solve Puzzle
              </div>
              <h2 className="text-4xl font-sans font-bold text-junior-text mb-12">
                {game.question}
              </h2>

              <form onSubmit={handleSubmit} className="flex items-end gap-4">
                <div className="flex-1 relative">
                  <label className="absolute -top-6 left-0 text-xs font-bold text-junior-accent uppercase">
                    Input Answer
                  </label>
                  <GameTooltip
                    content="Enter numerical value"
                    ageGroup={ageGroup}
                  >
                    <input
                      type="text"
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      className="w-full bg-transparent border-b-2 border-junior-accent/50 text-3xl font-mono text-junior-text py-2 outline-none focus:border-junior-primary transition-colors placeholder:text-junior-accent/30"
                      placeholder="Type here..."
                      autoFocus
                    />
                  </GameTooltip>
                </div>

                <GameTooltip content="Execute Validation" ageGroup={ageGroup}>
                  <button
                    disabled={checking}
                    className={`px-8 py-3 rounded-lg font-mono font-bold text-sm uppercase tracking-wider transition-all shadow-md active:translate-y-1 ${
                      result === "correct"
                        ? "bg-green-600 text-white"
                        : result === "incorrect"
                        ? "bg-red-500 text-white"
                        : "bg-junior-text text-white hover:bg-black"
                    }`}
                  >
                    {checking ? (
                      <LoadingSpinner size="sm" color="white" />
                    ) : result === "correct" ? (
                      "SUCCESS"
                    ) : result === "incorrect" ? (
                      "ERROR"
                    ) : (
                      "SUBMIT_"
                    )}
                  </button>
                </GameTooltip>
              </form>

              {result && (
                <div
                  className={`mt-6 p-4 rounded-lg font-mono text-sm border-l-4 ${
                    result === "correct"
                      ? "bg-green-50 border-green-500 text-green-700"
                      : "bg-red-50 border-red-500 text-red-700"
                  }`}
                >
                  {result === "correct"
                    ? "> Correct answer processed. Points allocated."
                    : "> Incorrect input detected. Please retry."}
                </div>
              )}
              {error && (
                <div className="mt-4">
                  <ErrorMessage
                    message={error}
                    onDismiss={() => setError(null)}
                    variant="inline"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Discovery (5-8): Default - Colorful card, standard fun UI
  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="bg-white rounded-[2.5rem] shadow-soft-lg border-4 border-disco-bg p-10 md:p-14 text-center relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#9CAF88_1px,transparent_1px)] [background-size:20px_20px]"></div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-disco-bg rounded-full text-disco-primary font-bold text-sm mb-6 shadow-sm">
            <Trophy size={16} />
            <span>Challenge</span>
          </div>

          <h2 className="text-4xl font-kids font-bold text-disco-text mb-10">
            {game.question}
          </h2>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col items-center gap-6 max-w-md mx-auto"
          >
            <GameTooltip
              content="Write your answer in this box"
              ageGroup={ageGroup}
            >
              <input
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Answer..."
                className="w-full text-center h-20 text-3xl font-kids rounded-2xl border-2 border-disco-bg focus:border-disco-secondary outline-none transition-all shadow-sm placeholder:text-disco-accent"
                autoFocus
              />
            </GameTooltip>

            <GameTooltip
              content="Click to see if you're right!"
              ageGroup={ageGroup}
            >
              <button
                disabled={checking}
                className={`w-full py-5 rounded-2xl text-xl font-bold text-white shadow-toy active:shadow-toy-active active:translate-y-[4px] transition-all flex items-center justify-center gap-3 ${
                  result === "correct"
                    ? "bg-disco-primary"
                    : result === "incorrect"
                    ? "bg-disco-secondary"
                    : "bg-disco-text hover:bg-opacity-90"
                }`}
              >
                {checking ? (
                  <LoadingSpinner size="sm" color="white" />
                ) : result === "correct" ? (
                  "Awesome!"
                ) : result === "incorrect" ? (
                  "Not quite, try again"
                ) : (
                  <>
                    Check It <ArrowRight size={20} />
                  </>
                )}
              </button>
            </GameTooltip>
          </form>
          {error && (
            <div className="mt-4">
              <ErrorMessage
                message={error}
                onDismiss={() => setError(null)}
                variant="inline"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SmartGame;
