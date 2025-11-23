"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";
import { ErrorMessage } from "./ErrorMessage";
import { LoadingSpinner } from "./LoadingSpinner";
import { apiClient } from "@/lib/api-client";
import { AgeGroup, ChildProfile } from "@/types";
import { getAgeGroup } from "@/types";
import { Check, Loader2 } from "lucide-react";
import clsx from "clsx";

interface AddChildModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (child: ChildProfile) => void;
  familyId: string;
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

export const AddChildModal: React.FC<AddChildModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  familyId,
}) => {
  const [name, setName] = useState("");
  const [age, setAge] = useState<number | "">("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [avatarSeed, setAvatarSeed] = useState<string>(AVATAR_SEEDS[0]);
  const [buddy, setBuddy] = useState<AgeGroup | "">("");
  const [preferredDifficulty, setPreferredDifficulty] = useState<
    "Easy" | "Medium" | "Hard" | ""
  >("");
  const [themePreference, setThemePreference] = useState<AgeGroup | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Reset form
      setName("");
      setAge("");
      setPin("");
      setConfirmPin("");
      setAvatarSeed(AVATAR_SEEDS[0]);
      setBuddy("");
      setPreferredDifficulty("");
      setThemePreference("");
      setError(null);
      setSuccess(false);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    setError(null);
    setSuccess(false);

    // Validation
    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    if (age === "" || age < 0 || age > 13) {
      setError("Age must be between 0 and 13");
      return;
    }

    if (pin.length !== 4 || !/^\d+$/.test(pin)) {
      setError("PIN must be exactly 4 digits");
      return;
    }

    if (pin !== confirmPin) {
      setError("PINs do not match");
      return;
    }

    setIsSubmitting(true);

    try {
      const ageNum = Number(age);
      const ageGroup = getAgeGroup(ageNum);

      const response = await apiClient.post("/api/children", {
        familyId,
        name: name.trim(),
        age: ageNum,
        pin,
        avatarUrl: `https://api.dicebear.com/9.x/avataaars/svg?seed=${avatarSeed}`,
        buddy: buddy || ageGroup,
        preferredDifficulty:
          preferredDifficulty ||
          (ageNum <= 4 ? "Easy" : ageNum <= 8 ? "Medium" : "Hard"),
        themePreference: themePreference || ageGroup,
      });

      const newChild: ChildProfile = {
        id: response.data.child.id,
        name: response.data.child.name,
        avatarUrl: response.data.child.avatarUrl,
        points: response.data.child.points || 0,
        age: response.data.child.age,
        buddy: response.data.child.buddy,
        preferredDifficulty: response.data.child.preferredDifficulty,
        themePreference: response.data.child.themePreference,
      };

      setSuccess(true);
      setTimeout(() => {
        onAdd(newChild);
        onClose();
        setSuccess(false);
      }, 1000);
    } catch (err: any) {
      console.error("Failed to add child:", err);
      setError(
        err.response?.data?.error ||
          err.message ||
          "Failed to add child. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Child" size="lg">
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
              Child added successfully!
            </p>
          </div>
        )}

        {/* Name */}
        <div>
          <label className="block text-sm font-bold text-scandi-stone mb-2">
            Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter child's name"
            className="w-full px-4 py-3 bg-scandi-cream border-2 border-transparent focus:border-scandi-honey rounded-xl outline-none font-bold text-scandi-chocolate transition"
            disabled={isSubmitting}
          />
        </div>

        {/* Age */}
        <div>
          <label className="block text-sm font-bold text-scandi-stone mb-2">
            Age *
          </label>
          <input
            type="number"
            min="0"
            max="13"
            value={age}
            onChange={(e) =>
              setAge(e.target.value === "" ? "" : parseInt(e.target.value))
            }
            placeholder="0-13"
            className="w-full px-4 py-3 bg-scandi-cream border-2 border-transparent focus:border-scandi-honey rounded-xl outline-none font-bold text-scandi-chocolate transition"
            disabled={isSubmitting}
          />
        </div>

        {/* PIN */}
        <div>
          <label className="block text-sm font-bold text-scandi-stone mb-2">
            PIN (4 digits) *
          </label>
          <input
            type="text"
            maxLength={4}
            value={pin}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "");
              setPin(value);
            }}
            placeholder="0000"
            className="w-full px-4 py-3 bg-scandi-cream border-2 border-transparent focus:border-scandi-honey rounded-xl outline-none font-bold text-scandi-chocolate transition"
            disabled={isSubmitting}
          />
          <p className="text-xs text-scandi-stone mt-1">
            Child will use this PIN to log in
          </p>
        </div>

        {/* Confirm PIN */}
        <div>
          <label className="block text-sm font-bold text-scandi-stone mb-2">
            Confirm PIN *
          </label>
          <input
            type="text"
            maxLength={4}
            value={confirmPin}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "");
              setConfirmPin(value);
            }}
            placeholder="0000"
            className="w-full px-4 py-3 bg-scandi-cream border-2 border-transparent focus:border-scandi-honey rounded-xl outline-none font-bold text-scandi-chocolate transition"
            disabled={isSubmitting}
          />
        </div>

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
                disabled={isSubmitting}
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
            disabled={isSubmitting}
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
              setPreferredDifficulty(e.target.value as "Easy" | "Medium" | "Hard" | "")
            }
            className="w-full px-4 py-3 bg-scandi-cream border-2 border-transparent focus:border-scandi-honey rounded-xl outline-none font-bold text-scandi-chocolate transition"
            disabled={isSubmitting}
          >
            <option value="">Auto (based on age)</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
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
            disabled={isSubmitting}
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
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin mr-2" size={18} />
                Adding...
              </>
            ) : (
              "Add Child"
            )}
          </Button>
          <Button onClick={onClose} variant="outline" disabled={isSubmitting}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
};

