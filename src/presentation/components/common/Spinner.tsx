'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

export const Spinner: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <Loader2 className={`animate-spin ${className}`} aria-hidden />
);
