import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  labelClassName?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'light' | 'dark';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      labelClassName,
      error,
      helperText,
      leftIcon,
      rightIcon,
      variant = 'light',
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    const isDark = variant === 'dark';

    const defaultLabelClass = isDark
      ? 'block text-sm font-medium text-slate-200 mb-1.5'
      : 'block text-sm font-medium text-slate-700 mb-1.5';

    const variantInputClass = isDark
      ? error
        ? 'border-red-500/80 focus:border-red-400 focus:ring-red-500/20 bg-red-950/30 text-white placeholder:text-slate-500'
        : 'border-slate-700 focus:border-rose-500 focus:ring-rose-500/20 bg-slate-800/80 text-white hover:border-slate-600 placeholder:text-slate-500'
      : error
      ? 'border-red-500 focus:border-red-500 focus:ring-red-200 bg-red-50 text-slate-900 placeholder:text-slate-400'
      : 'border-slate-200 focus:border-rose-500 focus:ring-rose-200 bg-white hover:border-slate-300 text-slate-900 placeholder:text-slate-400';

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className={labelClassName || defaultLabelClass}>
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full px-4 py-2.5 rounded-xl border text-sm transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-offset-0
              ${variantInputClass}
              ${leftIcon ? 'pl-10' : ''}
              ${rightIcon ? 'pr-11' : ''}
              ${className}
            `}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400">
              {rightIcon}
            </div>
          )}
        </div>
        {(error || helperText) && (
          <p
            className={`mt-1.5 text-xs ${
              error
                ? isDark
                  ? 'text-red-400 font-medium'
                  : 'text-red-500'
                : isDark
                ? 'text-slate-400'
                : 'text-slate-500'
            }`}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
