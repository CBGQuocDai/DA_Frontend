'use client';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card = ({ children, className = '' }: CardProps) => {
  return <div className={`card ${className}`}>{children}</div>;
};

export const CardHeader = ({ children, className = '' }: CardProps) => {
  return <div className={`card-header ${className}`}>{children}</div>;
};

export const CardContent = ({ children, className = '' }: CardProps) => {
  return <div className={`card-content ${className}`}>{children}</div>;
};

export const CardFooter = ({ children, className = '' }: CardProps) => {
  return <div className={`card-footer ${className}`}>{children}</div>;
};

export default Card;
