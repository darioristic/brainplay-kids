"use client";

import React, { useState } from "react";
import { ChildProfile, AgeGroup, getAgeGroup } from "@/types";
import { Plus, Settings, LogOut } from "lucide-react";
import clsx from "clsx";

interface Props {
  children: ChildProfile[];
  onSelectChild: (child: ChildProfile) => void;
  onAddChild: () => void;
  onSettings: () => void;
  onLogout: () => void;
  familyName?: string;
}

export default function ChildProfilePicker({
  children,
  onSelectChild,
  onAddChild,
  onSettings,
  onLogout,
  familyName = "Family",
}: Props) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-scandi-cream via-scandi-oat to-scandi-sand flex flex-col items-center justify-center p-8">
      {/* Header */}
      <div className="absolute top-8 right-8 flex items-center gap-4">
        <button
          onClick={onSettings}
          className="p-3 bg-white/80 backdrop-blur-sm text-scandi-chocolate rounded-full shadow-soft hover:shadow-soft-lg transition hover:scale-110"
          aria-label="Settings"
        >
          <Settings size={20} />
        </button>
        <button
          onClick={onLogout}
          className="p-3 bg-white/80 backdrop-blur-sm text-scandi-chocolate rounded-full shadow-soft hover:shadow-soft-lg transition hover:scale-110"
          aria-label="Logout"
        >
          <LogOut size={20} />
        </button>
      </div>

      {/* Main Content */}
      <div className="text-center mb-12 animate-fade-in">
        <h1 className="text-5xl md:text-6xl font-kids font-bold text-scandi-chocolate mb-4">
          Who's Playing?
        </h1>
        <p className="text-xl text-scandi-stone font-medium">
          {familyName} Family
        </p>
      </div>

      {/* Profile Grid */}
      <div className="flex flex-wrap items-center justify-center gap-8 max-w-5xl mb-12">
        {children.map((child, index) => {
          const ageGroup = getAgeGroup(child.age);
          const isHovered = hoveredIndex === index;

          return (
            <button
              key={child.id}
              onClick={() => onSelectChild(child)}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="group relative flex flex-col items-center transition-all duration-300"
              style={{
                transform: isHovered ? "scale(1.1)" : "scale(1)",
              }}
            >
              {/* Profile Avatar */}
              <div
                className={clsx(
                  "relative w-32 h-32 md:w-40 md:h-40 rounded-full border-4 transition-all duration-300 shadow-soft-lg",
                  isHovered
                    ? "border-scandi-honey shadow-soft-lg scale-110"
                    : "border-white",
                  ageGroup === AgeGroup.EARLY && "ring-4 ring-early-primary/20",
                  ageGroup === AgeGroup.DISCOVERY && "ring-4 ring-disco-primary/20",
                  ageGroup === AgeGroup.JUNIOR && "ring-4 ring-junior-primary/20"
                )}
              >
                <img
                  src={child.avatarUrl}
                  alt={child.name}
                  className="w-full h-full rounded-full object-cover"
                />
                {/* Points Badge */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-scandi-honey text-scandi-chocolate px-3 py-1 rounded-full text-sm font-bold shadow-toy whitespace-nowrap">
                  {child.points} ★
                </div>
              </div>

              {/* Name */}
              <div className="mt-6 text-center">
                <h3
                  className={clsx(
                    "text-2xl font-kids font-bold transition-colors duration-300",
                    isHovered ? "text-scandi-chocolate" : "text-scandi-stone"
                  )}
                >
                  {child.name}
                </h3>
                <p className="text-sm text-scandi-stone mt-1">
                  {ageGroup === AgeGroup.EARLY
                    ? "Early Play"
                    : ageGroup === AgeGroup.DISCOVERY
                    ? "Discovery"
                    : "Junior"}
                </p>
              </div>

              {/* Hover Glow Effect */}
              {isHovered && (
                <div
                  className={clsx(
                    "absolute inset-0 rounded-full blur-2xl opacity-50 -z-10 transition-opacity duration-300",
                    ageGroup === AgeGroup.EARLY && "bg-early-primary",
                    ageGroup === AgeGroup.DISCOVERY && "bg-disco-primary",
                    ageGroup === AgeGroup.JUNIOR && "bg-junior-primary"
                  )}
                />
              )}
            </button>
          );
        })}

        {/* Add Child Button */}
        <button
          onClick={onAddChild}
          onMouseEnter={() => setHoveredIndex(-1)}
          onMouseLeave={() => setHoveredIndex(null)}
          className="group flex flex-col items-center transition-all duration-300"
          style={{
            transform: hoveredIndex === -1 ? "scale(1.1)" : "scale(1)",
          }}
        >
          <div
            className={clsx(
              "w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-dashed border-scandi-stone flex items-center justify-center transition-all duration-300 shadow-soft",
              hoveredIndex === -1
                ? "border-scandi-moss bg-scandi-moss/10 scale-110"
                : "bg-white/50"
            )}
          >
            <Plus
              size={48}
              className={clsx(
                "transition-colors duration-300",
                hoveredIndex === -1 ? "text-scandi-moss" : "text-scandi-stone"
              )}
            />
          </div>
          <div className="mt-6 text-center">
            <h3
              className={clsx(
                "text-2xl font-kids font-bold transition-colors duration-300",
                hoveredIndex === -1 ? "text-scandi-chocolate" : "text-scandi-stone"
              )}
            >
              Add Child
            </h3>
          </div>
        </button>
      </div>

      {/* Footer */}
      <p className="text-sm text-scandi-stone text-center max-w-md">
        Select a profile to start playing and learning!
      </p>
    </div>
  );
}

