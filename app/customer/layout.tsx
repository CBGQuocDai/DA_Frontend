import React from 'react';
import { CustomerLayout } from '@/src/presentation/layouts';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <CustomerLayout>{children}</CustomerLayout>;
}
