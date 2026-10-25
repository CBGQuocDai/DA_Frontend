'use client';

import React, { useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface AuthTextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  /** Rendered on the right of the label row, e.g. a "Quên mật khẩu?" link. */
  labelAction?: React.ReactNode;
}

const inputClass = (hasError: boolean, extra = '') =>
  `w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 bg-white transition-all focus:outline-none focus:ring-1 ${
    hasError
      ? 'border-red-400 focus:border-red-500 focus:ring-red-400'
      : 'border-slate-200 focus:border-accent focus:ring-accent'
  } ${extra}`;

const FieldShell: React.FC<{
  id: string;
  label: string;
  error?: string;
  labelAction?: React.ReactNode;
  children: React.ReactNode;
}> = ({ id, label, error, labelAction, children }) => (
  <div>
    <div className="flex items-center justify-between mb-1.5">
      <label htmlFor={id} className="block text-xs font-semibold text-slate-800">
        {label}
      </label>
      {labelAction}
    </div>
    {children}
    {error && <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>}
  </div>
);

export const AuthTextField: React.FC<AuthTextFieldProps> = ({ label, error, labelAction, id, ...props }) => {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return (
    <FieldShell id={inputId} label={label} error={error} labelAction={labelAction}>
      <input id={inputId} className={inputClass(Boolean(error))} {...props} />
    </FieldShell>
  );
};

export const PasswordField: React.FC<Omit<AuthTextFieldProps, 'type'>> = ({
  label,
  error,
  labelAction,
  id,
  ...props
}) => {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [isVisible, setIsVisible] = useState(false);

  return (
    <FieldShell id={inputId} label={label} error={error} labelAction={labelAction}>
      <div className="relative">
        <input
          id={inputId}
          type={isVisible ? 'text' : 'password'}
          className={inputClass(Boolean(error), 'pr-10')}
          {...props}
        />
        <button
          type="button"
          onClick={() => setIsVisible((visible) => !visible)}
          className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
          tabIndex={-1}
          aria-label={isVisible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
        >
          {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </FieldShell>
  );
};
