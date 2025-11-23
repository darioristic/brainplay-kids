import React from 'react';
import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className,
  disabled,
  children,
  ...props
}) => {
  const baseClasses = 'font-bold rounded-full transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-scandi-moss text-white shadow-toy hover:bg-opacity-90 active:shadow-toy-active active:translate-y-[2px]',
    secondary: 'bg-scandi-clay text-white shadow-toy hover:bg-opacity-90 active:shadow-toy-active active:translate-y-[2px]',
    outline: 'bg-white border-2 border-scandi-oat text-scandi-chocolate hover:border-scandi-sand hover:bg-scandi-cream',
    ghost: 'bg-transparent text-scandi-chocolate hover:bg-scandi-cream',
    danger: 'bg-red-500 text-white shadow-toy hover:bg-red-600 active:shadow-toy-active active:translate-y-[2px]',
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button
      className={clsx(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span className="sr-only">Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

