'use client';

import { LoginForm } from "@/src/presentation/components/common/LoginForm";
import { API_ENDPOINTS, ROUTES } from "@/src/shared/constants";
import { useRouter } from "next/navigation";

export const AdminLoginPage = () => {
  const router = useRouter();

  const handleLoginSuccess = () => {
    router.push(ROUTES.ADMIN.STATISTICS);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Đăng nhập Quản trị</h1>
        <LoginForm endpoint={API_ENDPOINTS.AUTH.ADMIN_LOGIN} onSuccess={handleLoginSuccess} />
      </div>
    </div>
  );
};

export default AdminLoginPage;
