'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CustomerLayout } from '@/src/presentation/layouts';
import { useCustomerAuth } from '@/src/presentation/hooks/customer';
import { Breadcrumb } from '@/src/presentation/components/common';
import {
  ChangePasswordTab,
  FavoritesTab,
  MOCK_FAVORITES,
  MOCK_PURCHASED,
  ProfileInfoTab,
  ProfileSidebar,
  PurchasedTab,
  type ProfileTab,
} from '@/src/presentation/components/customer/profile';
import { ROUTES } from '@/src/shared/constants';

export const CustomerProfilePage: React.FC = () => {
  const router = useRouter();
  const { user, isReady, logout, refreshProfile } = useCustomerAuth();
  const [activeTab, setActiveTab] = useState<ProfileTab>('profile');
  const [favorites, setFavorites] = useState(MOCK_FAVORITES);

  useEffect(() => {
    if (!isReady) return;
    if (!user) {
      router.replace(ROUTES.CUSTOMER.LOGIN_THEN(ROUTES.CUSTOMER.PROFILE));
    }
  }, [isReady, user, router]);

  // Pull the latest profile once when the page opens
  const userId = user?.id;
  useEffect(() => {
    if (userId) refreshProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleLogout = () => {
    logout();
    router.push(ROUTES.CUSTOMER.LOGIN);
  };

  return (
    <CustomerLayout>
      <div className="space-y-6">
        <Breadcrumb items={[{ label: 'Trang chủ', href: ROUTES.CUSTOMER.HOME }, { label: 'Tài khoản cá nhân' }]} />

        {user && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <ProfileSidebar
              user={user}
              activeTab={activeTab}
              favoriteCount={favorites.length}
              purchasedCount={MOCK_PURCHASED.length}
              onSelectTab={setActiveTab}
              onLogout={handleLogout}
            />

            <main className="lg:col-span-8 xl:col-span-9 bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 min-h-[580px]">
              {activeTab === 'profile' && <ProfileInfoTab key={user.id} user={user} />}
              {activeTab === 'favorites' && (
                <FavoritesTab
                  items={favorites}
                  onRemove={(id) => setFavorites((prev) => prev.filter((item) => item.id !== id))}
                />
              )}
              {activeTab === 'purchased' && <PurchasedTab items={MOCK_PURCHASED} />}
              {activeTab === 'password' && <ChangePasswordTab />}
            </main>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
};
