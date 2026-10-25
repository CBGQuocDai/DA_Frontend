'use client';

import React from 'react';
import { CustomerLayout } from '@/src/presentation/layouts';
import { HeroBookshelf, NewBooksSection } from '@/src/presentation/components/customer/home';

export const CustomerHomePage: React.FC = () => (
  <CustomerLayout>
    <div className="space-y-14 md:space-y-16 pb-12">
      <HeroBookshelf />
      <NewBooksSection />
    </div>
  </CustomerLayout>
);
