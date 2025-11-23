import React from 'react';
import { AlertCircle, RefreshCw, X } from 'lucide-react';
import clsx from 'clsx';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  variant?: 'default' | 'inline' | 'banner';
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = 'Error',
  message,
  onRetry,
  onDismiss,
  variant = 'default',
  className,
}) => {
  if (variant === 'inline') {
    return (
      <div className={clsx('flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl', className)}>
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-bold text-red-800">{title}</p>
          <p className="text-sm text-red-700 mt-1">{message}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-red-600 hover:text-red-800 transition"
            aria-label="Dismiss error"
          >
            <X size={18} />
          </button>
        )}
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div className={clsx('flex items-center gap-3 p-4 bg-red-50 border-l-4 border-red-500', className)}>
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-bold text-red-800">{title}</p>
          <p className="text-sm text-red-700">{message}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-red-600 hover:text-red-800 transition"
            aria-label="Dismiss error"
          >
            <X size={18} />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={clsx('bg-white rounded-[2rem] shadow-soft-lg border border-red-200 p-8 max-w-md w-full', className)}>
      <div className="text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-xl font-bold text-scandi-chocolate mb-2">{title}</h3>
        <p className="text-scandi-stone mb-6">{message}</p>
        <div className="flex gap-3 justify-center">
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-6 py-3 bg-scandi-moss text-white rounded-full font-bold flex items-center gap-2 hover:bg-opacity-90 transition shadow-toy active:shadow-toy-active active:translate-y-[2px]"
            >
              <RefreshCw size={18} />
              Try Again
            </button>
          )}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="px-6 py-3 bg-scandi-oat text-scandi-chocolate rounded-full font-bold hover:bg-scandi-sand transition"
            >
              Dismiss
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

