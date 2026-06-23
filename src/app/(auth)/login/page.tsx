"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, LogIn, Eye, EyeOff, ShieldCheck, Building2 } from "lucide-react";
import { mainAuthAPI, resolvePostLoginUrl } from "@/infrastructure/api/mainAuthAPI";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "";
  const reason = searchParams.get("reason");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reasonMessage: Record<string, string> = {
    NOT_AUTHENTICATED: "Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.",
    SESSION_EXPIRED: "Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.",
    UNKNOWN_ROLE: "Tài khoản không có quyền truy cập hệ thống.",
    NO_TENANT: "Tài khoản chưa được gán doanh nghiệp. Liên hệ Admin.",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await mainAuthAPI.login({ email, password });

      if (!res?.data?.token) {
        setError(res?.message ?? "Đăng nhập thất bại. Kiểm tra lại thông tin.");
        return;
      }

      const { role, tenantId } = res.data;

      // Redirect dựa theo role
      const redirectTo = callbackUrl || resolvePostLoginUrl(role ?? "", tenantId);
      router.replace(redirectTo);
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string }; status?: number } };
      if (axiosError?.response?.status === 401) {
        setError("Email hoặc mật khẩu không đúng.");
      } else {
        setError(axiosError?.response?.data?.message ?? "Lỗi kết nối đến máy chủ. Thử lại sau.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-size-[4rem_4rem] opacity-30" />

      <div className="relative w-full max-w-md">
        {/* Logo / Brand */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-500/30">
            <ShieldCheck className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Smart Shopping ChatBot</h1>
          <p className="mt-1 text-sm text-slate-400">Cổng đăng nhập quản trị</p>
        </div>

        {/* Reason alert */}
        {reason && reasonMessage[reason] && (
          <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
            {reasonMessage[reason]}
          </div>
        )}

        {/* Card */}
        <div className="rounded-2xl border border-slate-700/50 bg-slate-800/80 p-8 shadow-2xl backdrop-blur-sm">
          <div className="mb-6 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-indigo-400" />
            <h2 className="text-lg font-semibold text-white">Đăng nhập hệ thống</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="admin-email" className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Email
              </label>
              <input
                id="admin-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="admin-password" className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-3 pr-12 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !email || !password}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-3 text-sm font-bold text-white transition-all hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 shadow-lg shadow-indigo-500/20"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang xác thực...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Đăng nhập
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-500">
            Chỉ dành cho Admin, Business Owner và Catalog Team.{" "}
            <a href="mailto:support@smartshopping.ai" className="text-indigo-400 hover:text-indigo-300">
              Liên hệ hỗ trợ
            </a>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-slate-600">
          Smart Shopping ChatBot © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
