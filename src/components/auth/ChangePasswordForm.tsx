"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, Loader2, ShieldCheck, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Password Strength Meter ────────────────────────────────────────────────

function getStrength(password: string): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: "", color: "" };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: "Rất yếu", color: "bg-red-500" };
  if (score === 2) return { score, label: "Yếu", color: "bg-orange-500" };
  if (score === 3) return { score, label: "Trung bình", color: "bg-yellow-500" };
  if (score === 4) return { score, label: "Mạnh", color: "bg-emerald-500" };
  return { score, label: "Rất mạnh", color: "bg-emerald-400" };
}

function PasswordStrengthBar({ password }: { password: string }) {
  const { score, label, color } = getStrength(password);
  if (!password) return null;

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div
            key={i}
            className="h-1 flex-1 rounded-full bg-white/10"
            animate={{}}
          >
            <motion.div
              className={cn("h-full rounded-full transition-all duration-300", i < score ? color : "")}
              initial={{ width: 0 }}
              animate={{ width: i < score ? "100%" : "0%" }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            />
          </motion.div>
        ))}
      </div>
      <p className="text-xs text-slate-400">
        Độ mạnh:{" "}
        <span className={cn("font-medium", {
          "text-red-400": score <= 1,
          "text-orange-400": score === 2,
          "text-yellow-400": score === 3,
          "text-emerald-400": score >= 4,
        })}>
          {label}
        </span>
      </p>
    </div>
  );
}

// ─── Password Rule Checklist ─────────────────────────────────────────────────

function PasswordRules({ password }: { password: string }) {
  const rules = [
    { label: "Ít nhất 8 ký tự", pass: password.length >= 8 },
    { label: "Có chữ hoa (A-Z)", pass: /[A-Z]/.test(password) },
    { label: "Có chữ số (0-9)", pass: /[0-9]/.test(password) },
    { label: "Có ký tự đặc biệt (!@#...)", pass: /[^A-Za-z0-9]/.test(password) },
  ];

  return (
    <ul className="mt-3 space-y-1">
      {rules.map((r) => (
        <li key={r.label} className="flex items-center gap-2 text-xs">
          <span className={cn(
            "flex h-4 w-4 items-center justify-center rounded-full text-[10px] transition-all",
            r.pass ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-slate-500"
          )}>
            {r.pass ? "✓" : "·"}
          </span>
          <span className={r.pass ? "text-slate-300" : "text-slate-500"}>{r.label}</span>
        </li>
      ))}
    </ul>
  );
}

// ─── Change Password Form ────────────────────────────────────────────────────

interface ChangePasswordFormProps {
  onSuccess?: () => void;
}

export function ChangePasswordForm({ onSuccess }: ChangePasswordFormProps) {
  const [form, setForm] = useState({ current: "", newPass: "", confirm: "" });
  const [show, setShow] = useState({ current: false, newPass: false, confirm: false });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.current || !form.newPass || !form.confirm) {
      setError("Vui lòng điền đầy đủ tất cả các trường.");
      return;
    }
    if (form.newPass !== form.confirm) {
      setError("Mật khẩu mới và xác nhận không khớp.");
      return;
    }
    if (form.newPass.length < 8) {
      setError("Mật khẩu mới phải có ít nhất 8 ký tự.");
      return;
    }

    setIsLoading(true);
    await new Promise((res) => setTimeout(res, 1500));
    setIsLoading(false);
    onSuccess?.();
  };

  const fields = [
    { key: "current" as const, label: "Mật khẩu tạm thời hiện tại", autoComplete: "current-password" },
    { key: "newPass" as const, label: "Mật khẩu mới", autoComplete: "new-password" },
    { key: "confirm" as const, label: "Xác nhận mật khẩu mới", autoComplete: "new-password" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/30">
          <Lock className="h-7 w-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Đổi mật khẩu</h1>
        <p className="mt-1.5 text-sm text-slate-400">
          Bạn đang dùng mật khẩu tạm thời. Vui lòng đặt mật khẩu mới ngay bây giờ.
        </p>
      </div>

      {/* Step indicator */}
      <div className="mb-6 flex items-center justify-center gap-2">
        {["Đăng nhập", "Đổi mật khẩu", "Hồ sơ"].map((step, i) => (
          <React.Fragment key={step}>
            <div className={cn(
              "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
              i === 1
                ? "bg-amber-500 text-white"
                : i < 1
                ? "bg-emerald-500 text-white"
                : "bg-white/10 text-slate-500"
            )}>
              {i < 1 ? "✓" : i + 1}
            </div>
            {i < 2 && <div className={cn("h-px w-8", i < 1 ? "bg-emerald-500" : "bg-white/10")} />}
          </React.Fragment>
        ))}
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
            >
              {error}
            </motion.div>
          )}

          {fields.map(({ key, label, autoComplete }) => (
            <div key={key} className="space-y-1.5">
              <label htmlFor={key} className="text-sm font-medium text-slate-300">
                {label}
              </label>
              <div className="relative">
                <input
                  id={key}
                  type={show[key] ? "text" : "password"}
                  autoComplete={autoComplete}
                  placeholder="••••••••"
                  value={form[key]}
                  onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                  disabled={isLoading}
                  className={cn(
                    "h-11 w-full rounded-lg border border-white/10 bg-white/5 px-4 pr-11 text-sm text-white placeholder:text-slate-500",
                    "transition-all outline-none",
                    "focus:border-amber-500/60 focus:bg-white/8 focus:ring-2 focus:ring-amber-500/20",
                    "disabled:cursor-not-allowed disabled:opacity-50"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShow((p) => ({ ...p, [key]: !p[key] }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-200"
                  aria-label={show[key] ? "Ẩn" : "Hiện"}
                >
                  {show[key] ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>

              {/* Show strength + rules only on new password field */}
              {key === "newPass" && form.newPass && (
                <>
                  <PasswordStrengthBar password={form.newPass} />
                  <PasswordRules password={form.newPass} />
                </>
              )}

              {/* Confirm match indicator */}
              {key === "confirm" && form.confirm && form.newPass && (
                <p className={cn("text-xs", form.confirm === form.newPass ? "text-emerald-400" : "text-red-400")}>
                  {form.confirm === form.newPass ? "✓ Mật khẩu khớp" : "✗ Mật khẩu chưa khớp"}
                </p>
              )}
            </div>
          ))}

          <button
            type="submit"
            disabled={isLoading}
            className={cn(
              "relative h-11 w-full overflow-hidden rounded-lg text-sm font-semibold text-white transition-all",
              "bg-gradient-to-r from-amber-500 to-orange-600",
              "hover:from-amber-400 hover:to-orange-500 hover:shadow-lg hover:shadow-amber-500/25",
              "active:scale-[0.98]",
              "disabled:cursor-not-allowed disabled:opacity-60"
            )}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang lưu...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                Đặt mật khẩu mới
                <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </button>
        </form>
      </div>
    </motion.div>
  );
}
