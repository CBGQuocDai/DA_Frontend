'use client';

import { LoginForm } from "@/src/presentation/components/admin/auth";
import { ROUTES } from "@/src/shared/constants";
import { useRouter } from "next/navigation";

export const AdminLoginPage = () => {
  const router = useRouter();

  const handleLoginSuccess = () => {
    router.push(ROUTES.ADMIN.STATISTICS);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="bg-surface border border-border p-8 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-text-primary">Đăng nhập Quản trị</h1>
        <LoginForm onSuccess={handleLoginSuccess} />
      </div>
    </div>
  );
};
