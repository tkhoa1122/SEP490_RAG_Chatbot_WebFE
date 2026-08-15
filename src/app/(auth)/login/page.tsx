"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, LogIn, Eye, EyeOff, ShieldCheck, Mail, LockKeyhole } from "lucide-react";
import { mainAuthAPI, resolvePostLoginUrl } from "@/infrastructure/api/mainAuthAPI";

function AdminLoginContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "";
  const reason = searchParams.get("reason");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reasonMessage: Record<string, string> = {
    SESSION_EXPIRED: "Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.",
    NOT_AUTHENTICATED: "Vui lòng đăng nhập để tiếp tục.",
    UNKNOWN_ROLE: "Tài khoản không có quyền truy cập hệ thống.",
    NO_TENANT: "Tài khoản chưa được gán doanh nghiệp. Liên hệ Admin.",
  };

  // Load saved email nếu đã chọn "Ghi nhớ đăng nhập" lần trước
  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedEmail = localStorage.getItem("remembered_email");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }

    // Trình duyệt sẽ tự động xóa session cookies khi tắt trình duyệt
    // Không cần dùng beforeunload vì nó sẽ chạy cả khi chuyển trang (redirect)
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // ── Bước 1: Xóa session cũ trước khi đăng nhập mới ──────────────────────
      // Tránh trường hợp cookie cũ (sai role/tenant) gây lỗi 403 sau khi redirect
      mainAuthAPI.logout();

      // ── Bước 2: Ghi nhớ / xóa email ─────────────────────────────────────────
      if (rememberMe) {
        localStorage.setItem("remembered_email", email);
      } else {
        localStorage.removeItem("remembered_email");
      }

      // ── Bước 3: Gọi API đăng nhập ────────────────────────────────────────────
      const res = await mainAuthAPI.login({ email, password, rememberMe });

      if (!res?.data?.accessToken) {
        setError(res?.message ?? "Đăng nhập thất bại. Kiểm tra lại thông tin.");
        return;
      }

      const { role, tenantId } = res.data;
      const redirectTo = callbackUrl || resolvePostLoginUrl(role ?? "", tenantId);

      // ── Bước 4: Force full-page reload để middleware đọc cookies mới ─────────
      // Dùng window.location.href thay vì router.replace vì middleware Next.js
      // chỉ đọc cookie ở server-side khi có full navigation (không phải SPA nav)
      window.location.href = redirectTo;
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
    <div className="w-full rounded-4xl bg-white p-8 sm:p-10 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] border border-slate-100">

      {/* Form Header */}
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#A8E6CF]/30 shadow-inner">
          <ShieldCheck className="h-7 w-7 text-[#2c5243]" />
        </div>
        <h2 className="text-2xl font-extrabold text-[#1c362b] tracking-tight">Chào mừng trở lại</h2>
        <p className="mt-2 text-sm text-slate-500">Đăng nhập vào hệ thống quản trị SaaS</p>
      </div>

      {/* Reason Alert */}
      {reason && reasonMessage[reason] && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm font-medium text-amber-700">
          {reasonMessage[reason]}
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email */}
        <div className="space-y-2">
          <label htmlFor="admin-email" className="text-[13px] font-semibold text-[#1c362b]">
            Địa chỉ Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <Mail className="h-4 w-4 text-slate-400" />
            </div>
            <input
              id="admin-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#5a9c82] focus:outline-none focus:ring-4 focus:ring-[#5a9c82]/10 transition-all"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="admin-password" className="text-[13px] font-semibold text-[#1c362b]">
              Mật khẩu
            </label>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <LockKeyhole className="h-4 w-4 text-slate-400" />
            </div>
            <input
              id="admin-password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-12 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#5a9c82] focus:outline-none focus:ring-4 focus:ring-[#5a9c82]/10 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-lg hover:bg-slate-100"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Remember Me */}
        <div className="flex items-center gap-2">
          <input
            id="remember-me"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-[#2c5243] focus:ring-[#5a9c82] cursor-pointer accent-[#2c5243]"
          />
          <label htmlFor="remember-me" className="text-sm text-slate-600 cursor-pointer select-none">
            Ghi nhớ đăng nhập
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#2c5243] px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#2c5243]/20 transition-all hover:bg-[#1c362b] focus:outline-none focus:ring-4 focus:ring-[#2c5243]/20 disabled:opacity-70"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              Đăng nhập <LogIn className="h-4 w-4 ml-1" />
            </>
          )}
        </button>
      </form>

      {/* Footer Text */}
      <div className="mt-8 flex flex-col items-center gap-2 text-[13px] font-medium text-slate-500">
        <p>Chỉ dành cho Admin, Business Owner và Catalog Team.</p>
        <div className="flex items-center gap-4">
          <Link href="/register" className="text-[#2c5243] font-bold hover:underline">
            Đăng ký cửa hàng
          </Link>
          <span className="text-slate-300">|</span>
          <Link href="/forgot-password" className="text-[#5a9c82] hover:underline hover:text-[#2c5243]">
            Quên mật khẩu?
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-[#2c5243]" />
      </div>
    }>
      <AdminLoginContent />
    </Suspense>
  );
}
