"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Mail, CheckCircle2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { mainAuthAPI } from "@/infrastructure/api/mainAuthAPI";

// ─── Input Component ────────────────────────────────────────────────────────
const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "h-11 w-full rounded-lg border bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm",
          "transition-all outline-none",
          "focus:ring-2",
          "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500",
          error 
            ? "border-red-300 focus:border-red-500 focus:ring-red-500/20" 
            : "border-slate-200 focus:border-[#A8E6CF] focus:ring-[#A8E6CF]/30",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn("text-sm font-semibold text-slate-700", className)}
      {...props}
    />
  )
);
Label.displayName = "Label";

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Vui lòng nhập email.");
      return;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Email không hợp lệ.");
      return;
    }

    setIsLoading(true);
    try {
      await mainAuthAPI.forgotPassword({ email });
      setIsSuccess(true);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.response?.data?.title || err.message || "Không thể gửi yêu cầu, vui lòng thử lại sau.";
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center text-center space-y-4 w-full"
      >
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#A8E6CF]/30">
          <CheckCircle2 className="h-10 w-10 text-[#2c5243]" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Yêu cầu đã được gửi!</h2>
        <p className="text-sm text-slate-500 max-w-[300px]">
          Link khôi phục mật khẩu đã được gửi vào email <b>{email}</b>. Vui lòng kiểm tra hộp thư (bao gồm cả mục Spam).
        </p>
        <Link 
          href="/login"
          className="mt-4 flex h-11 items-center justify-center rounded-lg bg-[#A8E6CF] px-8 text-sm font-semibold text-[#1c362b] shadow-sm transition-all hover:bg-[#97d0ba] hover:shadow"
        >
          Quay lại Đăng nhập
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="w-full"
    >
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Quên mật khẩu?</h1>
        <p className="mt-1 text-sm text-slate-500">
          Đừng lo lắng, hãy nhập email của bạn và chúng tôi sẽ gửi hướng dẫn khôi phục mật khẩu.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-200/50">
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          
          <div className="space-y-1.5">
            <Label htmlFor="email">Email quản trị</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="admin@ecofashion.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError("");
                }}
                error={!!error}
                disabled={isLoading}
                className="pl-10"
              />
            </div>
            {error && <p className="mt-1 text-xs font-medium text-red-500">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="relative flex h-11 w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-[#A8E6CF] text-sm font-semibold text-[#1c362b] shadow-sm transition-all hover:bg-[#97d0ba] hover:shadow disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang gửi...
              </>
            ) : (
              "Gửi yêu cầu khôi phục"
            )}
          </button>
        </form>

        <div className="mt-6 flex justify-center">
          <Link href="/login" className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#2c5243] transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
