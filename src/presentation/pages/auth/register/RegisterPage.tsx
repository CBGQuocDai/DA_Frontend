"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/presentation/hooks";
import { isValidEmail } from "@/src/shared/utils";
import { ROUTES } from "@/src/shared/constants";

export const RegisterPage: React.FC = () => {
  const router = useRouter();
  const { register, isAuthenticated, user } = useAuth();

  // Form states: Email, Họ tên, Mật khẩu
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Status states
  const [errors, setErrors] = useState<{
    email?: string;
    fullName?: string;
    password?: string;
    general?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Nếu người dùng đã đăng nhập từ trước, tự động chuyển trang
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === "ADMIN") {
        router.push(ROUTES.ADMIN);
      } else {
        router.push(ROUTES.CUSTOMER);
      }
    }
  }, [isAuthenticated, user, router]);

  // Kiểm tra tính hợp lệ của dữ liệu đầu vào
  const validate = (): boolean => {
    const newErrors: { email?: string; fullName?: string; password?: string } =
      {};

    // 1. Kiểm tra Email
    if (!email.trim()) {
      newErrors.email = "Vui lòng nhập địa chỉ email";
    } else if (!isValidEmail(email)) {
      newErrors.email = "Email không hợp lệ (VD: user@example.com)";
    }

    // 2. Kiểm tra Họ và tên
    if (!fullName.trim()) {
      newErrors.fullName = "Vui lòng nhập họ và tên của bạn";
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = "Họ và tên phải có ít nhất 2 ký tự";
    }

    // 3. Kiểm tra Mật khẩu
    if (!password) {
      newErrors.password = "Vui lòng nhập mật khẩu";
    } else if (password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      // Đăng ký vai trò CUSTOMER với 3 thông tin: email, password, fullName
      await register(email.trim(), password, fullName.trim(), "CUSTOMER");

      // Đăng ký thành công & tự động đăng nhập, chuyển sang trang khách hàng
      setTimeout(() => {
        router.push(ROUTES.CUSTOMER);
      }, 400);
    } catch (err: unknown) {
      setIsSubmitting(false);

      interface ApiErrorResponse {
        response?: {
          data?: {
            message?: string;
            code?: number;
          };
          status?: number;
        };
        message?: string;
      }

      const apiErr = err as ApiErrorResponse;
      let errorMsg =
        "Đăng ký tài khoản không thành công. Vui lòng thử lại sau!";

      if (apiErr.response?.data?.message) {
        errorMsg = apiErr.response.data.message;
      } else if (apiErr.response?.status === 400) {
        errorMsg = "Thông tin đăng ký không hợp lệ hoặc email đã tồn tại.";
      } else if (apiErr.message && apiErr.message.includes("Network Error")) {
        errorMsg =
          "Không thể kết nối đến máy chủ Backend (http://localhost:8080/api). Vui lòng kiểm tra Backend!";
      }

      // Nếu phát hiện email đã tồn tại, đánh dấu lỗi vào trường email
      if (
        apiErr.response?.data?.code === 4004 ||
        errorMsg.toLowerCase().includes("email đã tồn tại")
      ) {
        setErrors({
          email: "Địa chỉ email này đã được sử dụng. Vui lòng chọn email khác.",
          general: "Email đã tồn tại trên hệ thống.",
        });
      } else {
        setErrors({ general: errorMsg });
      }
    }
  };

  return (
    <div className="w-full">
      {/* Tiêu đề & Giới thiệu */}
      <div className="text-center mb-7">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Đăng ký
        </h1>
        {/* <p className="text-sm text-slate-500 mt-2">
          Tạo tài khoản khách hàng để trải nghiệm nghe sách
        </p> */}
      </div>

      {/* Thông báo lỗi tổng quát */}
      {errors.general && (
        <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-start gap-2.5">
          <svg
            className="w-4 h-4 flex-shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p className="font-medium">{errors.general}</p>
        </div>
      )}

      {/* Form nhập 3 trường: Email, Họ tên, Mật khẩu */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 1. Trường Email */}
        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-1.5">
            Email
          </label>
          <input
            type="email"
            placeholder="Nhập địa chỉ email của bạn"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email)
                setErrors((prev) => ({ ...prev, email: undefined }));
            }}
            disabled={isSubmitting}
            autoComplete="email"
            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 bg-white transition-all focus:outline-none focus:ring-1 ${
              errors.email
                ? "border-red-400 focus:border-red-500 focus:ring-red-400"
                : "border-slate-200 focus:border-rose-600 focus:ring-rose-600"
            }`}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-500 font-medium">
              {errors.email}
            </p>
          )}
        </div>

        {/* 2. Trường Họ tên */}
        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-1.5">
            Họ tên
          </label>
          <input
            type="text"
            placeholder="Nhập họ và tên đầy đủ của bạn"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              if (errors.fullName)
                setErrors((prev) => ({ ...prev, fullName: undefined }));
            }}
            disabled={isSubmitting}
            autoComplete="name"
            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 bg-white transition-all focus:outline-none focus:ring-1 ${
              errors.fullName
                ? "border-red-400 focus:border-red-500 focus:ring-red-400"
                : "border-slate-200 focus:border-rose-600 focus:ring-rose-600"
            }`}
          />
          {errors.fullName && (
            <p className="mt-1 text-xs text-red-500 font-medium">
              {errors.fullName}
            </p>
          )}
        </div>

        {/* 3. Trường Mật khẩu */}
        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-1.5">
            Mật khẩu
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Tối thiểu 6 ký tự"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password)
                  setErrors((prev) => ({ ...prev, password: undefined }));
              }}
              disabled={isSubmitting}
              autoComplete="new-password"
              className={`w-full px-3.5 py-2.5 pr-10 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 bg-white transition-all focus:outline-none focus:ring-1 ${
                errors.password
                  ? "border-red-400 focus:border-red-500 focus:ring-red-400"
                  : "border-slate-200 focus:border-rose-600 focus:ring-rose-600"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              tabIndex={-1}
              aria-label="Ẩn hiện mật khẩu"
            >
              {showPassword ? (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                  />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-red-500 font-medium">
              {errors.password}
            </p>
          )}
        </div>

        {/* Nút Đăng ký tài khoản */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm transition-all shadow-md shadow-rose-600/25 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed mt-2 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin h-4 w-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Đang đăng ký...</span>
            </>
          ) : (
            "Đăng ký tài khoản"
          )}
        </button>
      </form>

      {/* Footer Chuyển sang Đăng nhập */}
      <div className="mt-6 text-center text-xs text-slate-500">
        Đã có tài khoản?{" "}
        <Link
          href={ROUTES.AUTH.LOGIN || "/login"}
          className="font-semibold text-rose-600 hover:text-rose-700 hover:underline transition-colors"
        >
          Đăng nhập ngay
        </Link>
      </div>
    </div>
  );
};

export default RegisterPage;
