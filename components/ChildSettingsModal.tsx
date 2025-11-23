"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";
import { ErrorMessage } from "./ErrorMessage";
import { LoadingSpinner } from "./LoadingSpinner";
import { apiClient } from "@/lib/api-client";
import { AgeGroup, Difficulty, ChildProfile } from "@/types";
import { Check, Loader2 } from "lucide-react";
import clsx from "clsx";

interface ChildSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  child: ChildProfile;
  onUpdate: (updatedChild: ChildProfile) => void;
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

export const ChildSettingsModal: React.FC<ChildSettingsModalProps> = ({
  isOpen,
  onClose,
  child,
  onUpdate,
}) => {
  const [avatarSeed, setAvatarSeed] = useState<string>("");
  const [buddy, setBuddy] = useState<AgeGroup | "">("");
  const [preferredDifficulty, setPreferredDifficulty] = useState<
    Difficulty | ""
  >("");
  const [themePreference, setThemePreference] = useState<AgeGroup | "">("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && child) {
      // Extract seed from avatar URL or use default
      const urlMatch = child.avatarUrl.match(/seed=([^&]+)/);
      setAvatarSeed(urlMatch ? urlMatch[1] : AVATAR_SEEDS[0]);
      setBuddy(child.buddy || "");
      setPreferredDifficulty((child.preferredDifficulty as Difficulty) || "");
      setThemePreference(child.themePreference || "");
      setError(null);
      setSuccess(false);
    }
  }, [isOpen, child]);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const updateData: any = {};

      // Update avatar URL if seed changed
      if (avatarSeed) {
        updateData.avatarUrl = `https://api.dicebear.com/9.x/avataaars/svg?seed=${avatarSeed}`;
      }

      if (buddy) {
        updateData.buddy = buddy;
      }

      if (preferredDifficulty) {
        updateData.preferredDifficulty = preferredDifficulty;
      }

      if (themePreference) {
        updateData.themePreference = themePreference;
      }

      const response = await apiClient.put(
        `/api/children/${child.id}/settings`,
        updateData
      );
      const updatedChild = response.data.child;

      // Update local state
      onUpdate({
        ...child,
        ...updatedChild,
        avatarUrl: updatedChild.avatarUrl || child.avatarUrl,
        buddy: updatedChild.buddy,
        preferredDifficulty: updatedChild.preferredDifficulty,
        themePreference: updatedChild.themePreference,
      });

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 1000);
    } catch (err: any) {
      console.error("Failed to update child settings:", err);
      setError(err.message || "Failed to update settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Child Settings" size="lg">
      <div className="space-y-6">
        {error && (
          <ErrorMessage
            message={error}
            onDismiss={() => setError(null)}
            variant="inline"
          />
        )}

        {success && (
          <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
            <Check className="w-5 h-5 text-green-600" />
            <p className="text-sm font-bold text-green-800">
              Settings saved successfully!
            </p>
          </div>
        )}

        {/* Avatar Selection */}
        <div>
          <label className="block text-sm font-bold text-scandi-stone mb-3">
            Avatar
          </label>
          <div className="grid grid-cols-4 gap-3">
            {AVATAR_SEEDS.map((seed) => (
              <button
                key={seed}
                onClick={() => setAvatarSeed(seed)}
                className={clsx(
                  "relative w-16 h-16 rounded-full overflow-hidden border-4 transition-all",
                  avatarSeed === seed
                    ? "border-scandi-honey scale-110 shadow-lg"
                    : "border-transparent hover:border-scandi-oat"
                )}
              >
                <img
                  src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}`}
                  alt={seed}
                  className="w-full h-full"
                />
                {avatarSeed === seed && (
                  <div className="absolute inset-0 bg-scandi-honey/20 flex items-center justify-center">
                    <Check className="w-6 h-6 text-scandi-honey" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Buddy (Owl Persona) */}
        <div>
          <label className="block text-sm font-bold text-scandi-stone mb-2">
            Owl Buddy Persona
          </label>
          <select
            value={buddy}
            onChange={(e) => setBuddy(e.target.value as AgeGroup | "")}
            className="w-full px-4 py-3 bg-scandi-cream border-2 border-transparent focus:border-scandi-honey rounded-xl outline-none font-bold text-scandi-chocolate transition"
          >
            <option value="">Auto (based on age)</option>
            <option value={AgeGroup.EARLY}>Early Play (Ages 0-4)</option>
            <option value={AgeGroup.DISCOVERY}>Discovery (Ages 5-8)</option>
            <option value={AgeGroup.JUNIOR}>Junior Brain (Ages 9-13)</option>
          </select>
          <p className="text-xs text-scandi-stone mt-1">
            Choose the personality style for the Owl assistant
          </p>
        </div>

        {/* Preferred Difficulty */}
        <div>
          <label className="block text-sm font-bold text-scandi-stone mb-2">
            Preferred Difficulty
          </label>
          <select
            value={preferredDifficulty}
            onChange={(e) =>
              setPreferredDifficulty(e.target.value as Difficulty | "")
            }
            className="w-full px-4 py-3 bg-scandi-cream border-2 border-transparent focus:border-scandi-honey rounded-xl outline-none font-bold text-scandi-chocolate transition"
          >
            <option value="">Auto (based on age)</option>
            <option value={Difficulty.Easy}>Easy</option>
            <option value={Difficulty.Medium}>Medium</option>
            <option value={Difficulty.Hard}>Hard</option>
          </select>
          <p className="text-xs text-scandi-stone mt-1">
            Default difficulty level for games
          </p>
        </div>

        {/* Theme Preference */}
        <div>
          <label className="block text-sm font-bold text-scandi-stone mb-2">
            Theme Preference
          </label>
          <select
            value={themePreference}
            onChange={(e) =>
              setThemePreference(e.target.value as AgeGroup | "")
            }
            className="w-full px-4 py-3 bg-scandi-cream border-2 border-transparent focus:border-scandi-honey rounded-xl outline-none font-bold text-scandi-chocolate transition"
          >
            <option value="">Auto (based on age)</option>
            <option value={AgeGroup.EARLY}>Early Play Theme</option>
            <option value={AgeGroup.DISCOVERY}>Discovery Theme</option>
            <option value={AgeGroup.JUNIOR}>Junior Brain Theme</option>
          </select>
          <p className="text-xs text-scandi-stone mt-1">
            Visual theme and color scheme
          </p>
        </div>

        <div className="flex gap-3 pt-4">
          <Button onClick={handleSave} disabled={isSaving} className="flex-1">
            {isSaving ? (
              <>
                <Loader2 className="animate-spin mr-2" size={18} />
                Saving...
              </>
            ) : (
              "Save Settings"
            )}
          </Button>
          <Button onClick={onClose} variant="outline" disabled={isSaving}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
};
