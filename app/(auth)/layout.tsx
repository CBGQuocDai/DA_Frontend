import React from 'react';
import { AuthLayout } from '@/src/presentation/layouts';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AuthLayout>{children}</AuthLayout>;
}
