import React from 'react';
import { AdminLayout } from '@/src/presentation/layouts';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}
