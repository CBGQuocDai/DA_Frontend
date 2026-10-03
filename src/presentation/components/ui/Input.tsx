'use client';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = ({ label, error, className = '', ...props }: InputProps) => {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-text-primary">{label}</label>
      )}
      <input
        className={`w-full px-4 py-2.5 bg-surface border rounded-md text-sm transition-colors duration-150 placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/10 ${
          error ? 'border-error focus:border-error' : 'border-border focus:border-accent'
        } ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-error">{error}</span>}
    </div>
  );
};

export default Input;
