import React from 'react';
import clsx from 'clsx';

interface LoadingSkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  className,
  variant = 'rectangular',
  width,
  height,
  lines = 1,
}) => {
  const baseClasses = 'animate-pulse bg-scandi-oat rounded';

  if (variant === 'text' && lines > 1) {
    return (
      <div className={clsx('space-y-2', className)}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={clsx(
              baseClasses,
              index === lines - 1 ? 'w-3/4' : 'w-full',
              height || 'h-4'
            )}
            style={width && index === 0 ? { width } : undefined}
          />
        ))}
      </div>
    );
  }

  const variantClasses = {
    text: 'h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  return (
    <div
      className={clsx(
        baseClasses,
        variantClasses[variant],
        !width && variant === 'text' && 'w-full',
        !height && variantClasses[variant],
        className
      )}
      style={{
        width: width || (variant === 'circular' ? height : undefined),
        height: height || (variant === 'circular' ? width : undefined),
      }}
      aria-label="Loading content"
    />
  );
};

// Pre-built skeleton components for common use cases
export const CardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={clsx('bg-white rounded-[2rem] p-8 border border-scandi-oat', className)}>
    <LoadingSkeleton variant="rectangular" height="24px" width="60%" className="mb-4" />
    <LoadingSkeleton variant="text" lines={3} className="mb-4" />
    <LoadingSkeleton variant="rectangular" height="40px" width="40%" />
  </div>
);

export const DashboardSkeleton: React.FC = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <CardSkeleton className="lg:col-span-2" />
      <CardSkeleton />
    </div>
  </div>
);

export const GameSkeleton: React.FC = () => (
  <div className="bg-white rounded-[3rem] border-8 border-dashed border-scandi-oat p-8 md:p-12">
    <LoadingSkeleton variant="rectangular" height="32px" width="70%" className="mb-6 mx-auto" />
    <LoadingSkeleton variant="text" lines={4} className="mb-8" />
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <LoadingSkeleton key={i} variant="rectangular" height="60px" className="rounded-xl" />
      ))}
    </div>
  </div>
);

