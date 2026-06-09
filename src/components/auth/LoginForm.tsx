"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, LogIn, Loader2, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginFormProps {
  onSuccess?: (isFirstLogin: boolean) => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [form, setForm] = useState<LoginFormData>({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.email || !form.password) {
      setError("Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    setIsLoading(true);
    // Simulate API call
    await new Promise((res) => setTimeout(res, 1500));
    setIsLoading(false);

    // Simulate: first login detection (replace with real logic)
    const isFirstLogin = form.password === "temp123";
    onSuccess?.(isFirstLogin);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Logo + Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30">
          <ShoppingBag className="h-7 w-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Đăng nhập vào SmartShop
        </h1>
        <p className="mt-1.5 text-sm text-slate-400">
          Quản lý chatbot thương mại điện tử của bạn
        </p>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
            >
              {error}
            </motion.div>
          )}

          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium text-slate-300">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              disabled={isLoading}
              className={cn(
                "h-11 w-full rounded-lg border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-slate-500",
                "transition-all outline-none",
                "focus:border-indigo-500/60 focus:bg-white/8 focus:ring-2 focus:ring-indigo-500/20",
                "disabled:cursor-not-allowed disabled:opacity-50"
              )}
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-medium text-slate-300">
                Mật khẩu
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-indigo-400 transition-colors hover:text-indigo-300"
              >
                Quên mật khẩu?
              </Link>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                disabled={isLoading}
                className={cn(
                  "h-11 w-full rounded-lg border border-white/10 bg-white/5 px-4 pr-11 text-sm text-white placeholder:text-slate-500",
                  "transition-all outline-none",
                  "focus:border-indigo-500/60 focus:bg-white/8 focus:ring-2 focus:ring-indigo-500/20",
                  "disabled:cursor-not-allowed disabled:opacity-50"
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-200"
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? (
                  <EyeOff className="h-4.5 w-4.5" />
                ) : (
                  <Eye className="h-4.5 w-4.5" />
                )}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className={cn(
              "relative h-11 w-full overflow-hidden rounded-lg text-sm font-semibold text-white transition-all",
              "bg-gradient-to-r from-indigo-600 to-violet-600",
              "hover:from-indigo-500 hover:to-violet-500 hover:shadow-lg hover:shadow-indigo-500/25",
              "active:scale-[0.98]",
              "disabled:cursor-not-allowed disabled:opacity-60"
            )}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang đăng nhập...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <LogIn className="h-4 w-4" />
                Đăng nhập
              </span>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          Bằng cách đăng nhập, bạn đồng ý với{" "}
          <Link href="#" className="text-slate-400 hover:text-slate-300 underline">
            Điều khoản dịch vụ
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
