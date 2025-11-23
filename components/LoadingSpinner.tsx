import React from "react";
import clsx from "clsx";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: "primary" | "secondary" | "white";
  className?: string;
}

const sizeClasses: Record<"sm" | "md" | "lg", string> = {
  sm: "w-4 h-4 border-2",
  md: "w-8 h-8 border-4",
  lg: "w-12 h-12 border-4",
};

const colorClasses: Record<"primary" | "secondary" | "white", string> = {
  primary: "border-scandi-honey border-t-transparent",
  secondary: "border-scandi-moss border-t-transparent",
  white: "border-white border-t-transparent",
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  color = "primary",
  className,
}) => {
  const sizeClass: string = sizeClasses[size as keyof typeof sizeClasses];
  const colorClass: string = colorClasses[color as keyof typeof colorClasses];

  return (
    <div
      className={clsx(
        "animate-spin rounded-full",
        sizeClass,
        colorClass,
        className
      )}
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};
