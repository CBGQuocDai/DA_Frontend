'use client';

import { useState } from "react";
import { authService } from "@/src/infrastructure/api/services";
import { getApiErrorMessage } from "@/src/shared/utils";
import { Button } from "@/src/presentation/components/common";

interface LoginFormProps {
    onSuccess?: () => void;
}

export const LoginForm = ({ onSuccess }: LoginFormProps) => {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            await authService.login({ email, password }, true);
            onSuccess?.();
        } catch (err) {
            setError(getApiErrorMessage(err, "Đăng nhập thất bại. Vui lòng thử lại."));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="text-error text-sm">{error}</div>
            )}
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-1.5">Email</label>
                <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                    className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
                />
            </div>
            <div>
                <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-1.5">Mật khẩu</label>
                <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mật khẩu"
                    required
                    className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
                />
            </div>
            <div>
                <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
                </Button>
            </div>
        </form>
    );
};
