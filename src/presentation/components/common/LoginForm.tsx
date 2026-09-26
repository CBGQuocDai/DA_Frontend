'use client';

import { useState } from "react";
import { apiClient } from "@/src/infrastructure/api/config/apiClient";
import { STORAGE_KEYS } from "@/src/shared/constants";
import { LoginRequest } from "@/src/shared/types";

interface LoginFormProps {
    endpoint: string;
    onSuccess?: () => void;
}

export const LoginForm = ({ endpoint, onSuccess }: LoginFormProps) => {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const login: LoginRequest = {
                email,
                password
            }
            const response = await apiClient.post(endpoint, login);
            const { accessToken } = response.data;

            localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);

            onSuccess?.();
        } catch (err: unknown) {
            const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Login failed. Please try again.";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="text-red-500 text-sm">{error}</div>
            )}
            <div>
                <label htmlFor="email">Email</label>
                <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                    className="w-full border rounded px-3 py-2"
                />
            </div>
            <div>
                <label htmlFor="password">Mật khẩu</label>
                <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mật khẩu"
                    required
                    className="w-full border rounded px-3 py-2"
                />
            </div>
            <div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
                </button>
            </div>
        </form>
    );
};

export default LoginForm;
