'use client';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card = ({ children, className = '' }: CardProps) => {
  return (
    <div className={`bg-surface rounded-lg border border-border-light shadow-sm ${className}`}>
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }: CardProps) => {
  return (
    <div className={`px-5 py-4 border-b border-border-light ${className}`}>
      {children}
    </div>
  );
};

export const CardContent = ({ children, className = '' }: CardProps) => {
  return <div className={`px-5 py-4 ${className}`}>{children}</div>;
};

export const CardFooter = ({ children, className = '' }: CardProps) => {
  return (
    <div className={`px-5 py-4 border-t border-border-light ${className}`}>
      {children}
    </div>
  );
};

export default Card;
