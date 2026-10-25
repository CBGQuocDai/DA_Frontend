'use client';

import React from 'react';
import { CustomerFooter, CustomerHeader } from '@/src/presentation/components/customer/layout';

interface CustomerLayoutProps {
  children: React.ReactNode;
}

export const CustomerLayout: React.FC<CustomerLayoutProps> = ({ children }) => (
  <div className="theme-customer min-h-screen flex flex-col bg-[#f8fafc] text-slate-900">
    <CustomerHeader />
    <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    <CustomerFooter />
  </div>
);
