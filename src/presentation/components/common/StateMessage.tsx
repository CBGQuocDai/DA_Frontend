'use client';

import React from 'react';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry, className = '' }) => (
  <div className={`p-5 rounded-xl bg-error-light border border-error/20 text-center ${className}`}>
    <p className="text-sm text-error font-medium mb-2">{message}</p>
    {onRetry && (
      <button
        type="button"
        onClick={onRetry}
        className="px-4 py-1.5 rounded-lg bg-accent text-white text-xs font-semibold hover:bg-accent-hover transition-colors shadow-sm"
      >
        Thử lại
      </button>
    )}
  </div>
);

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = '',
}) => (
  <div
    className={`py-12 px-4 rounded-xl border border-dashed border-border text-center bg-bg/50 ${className}`}
  >
    {icon && <div className="flex justify-center mb-2 text-text-muted">{icon}</div>}
    <p className="text-sm font-semibold text-text-primary">{title}</p>
    {description && <p className="text-xs text-text-secondary mt-1 max-w-sm mx-auto">{description}</p>}
    {action && <div className="pt-3">{action}</div>}
  </div>
);
