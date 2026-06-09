"use client";

import React, { useState, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  LogIn,
  Loader2,
  Lock,
  ShieldCheck,
  ArrowRight,
  User,
  Phone,
  Upload,
  X,
  Camera,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

// ─── Types ──────────────────────────────────────────────────────────────────

type Step = 1 | 2 | 3 | 4;

interface FieldErrors {
  [key: string]: string;
}

// ─── Step Indicator (4 steps) ───────────────────────────────────────────────

const STEP_LABELS = ["Đăng nhập", "Đổi mật khẩu", "Hồ sơ", "Hoàn tất"];

function StepIndicator({ current }: { current: Step }) {
  return (
    <div className="mb-8 flex items-center justify-center gap-1.5">
      {STEP_LABELS.map((label, i) => {
        const stepNum = (i + 1) as Step;
        const isDone = stepNum < current;
        const isActive = stepNum === current;

        return (
          <React.Fragment key={label}>
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold transition-all duration-300",
                  isDone && "bg-[#A8E6CF] text-[#1c362b]",
                  isActive && "bg-[#2c5243] text-white shadow-md shadow-[#2c5243]/30",
                  !isDone && !isActive && "bg-slate-200 text-slate-500"
                )}
              >
                {isDone ? "✓" : stepNum}
              </div>
              <span
                className={cn(
                  "hidden text-[10px] font-medium sm:block",
                  isActive ? "text-[#2c5243]" : isDone ? "text-slate-500" : "text-slate-400"
                )}
              >
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div
                className={cn(
                  "mb-4 h-px w-6 transition-colors duration-300 sm:w-10",
                  isDone ? "bg-[#A8E6CF]" : "bg-slate-200"
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Password Strength ──────────────────────────────────────────────────────

function getStrength(pw: string) {
  if (!pw) return { score: 0, label: "", color: "" };
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  if (s <= 1) return { score: s, label: "Rất yếu", color: "bg-red-500" };
  if (s === 2) return { score: s, label: "Yếu", color: "bg-orange-500" };
  if (s === 3) return { score: s, label: "Trung bình", color: "bg-yellow-500" };
  if (s === 4) return { score: s, label: "Mạnh", color: "bg-[#A8E6CF]" };
  return { score: s, label: "Rất mạnh", color: "bg-[#8fd4ba]" };
}

function PasswordStrength({ password }: { password: string }) {
  const { score, label, color } = getStrength(password);
  if (!password) return null;

  const rules = [
    { ok: password.length >= 8, text: "Ít nhất 8 ký tự" },
    { ok: /[A-Z]/.test(password), text: "Có chữ hoa (A-Z)" },
    { ok: /[0-9]/.test(password), text: "Có chữ số (0-9)" },
    { ok: /[^A-Za-z0-9]/.test(password), text: "Có ký tự đặc biệt (!@#...)" },
  ];

  return (
    <div className="mt-2.5 space-y-2">
      {/* Bar */}
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
            <motion.div
              className={cn("h-full rounded-full", i < score ? color : "")}
              initial={{ width: 0 }}
              animate={{ width: i < score ? "100%" : "0%" }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            />
          </div>
        ))}
      </div>
      <p className="text-[11px] text-slate-500">
        Độ mạnh:{" "}
        <span className={cn("font-semibold", {
          "text-red-500": score <= 1,
          "text-orange-500": score === 2,
          "text-yellow-500": score === 3,
          "text-[#5a9c82]": score >= 4,
        })}>
          {label}
        </span>
      </p>

      {/* Rules */}
      <ul className="space-y-1">
        {rules.map((r) => (
          <li key={r.text} className="flex items-center gap-2 text-[11px]">
            <span
              className={cn(
                "flex h-3.5 w-3.5 items-center justify-center rounded-full text-[9px]",
                r.ok ? "bg-[#A8E6CF]/50 text-[#1c362b]" : "bg-slate-100 text-slate-400"
              )}
            >
              {r.ok ? "✓" : "·"}
            </span>
            <span className={r.ok ? "text-slate-700" : "text-slate-500"}>{r.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Avatar Dropzone ────────────────────────────────────────────────────────

function AvatarDropzone({
  value,
  onChange,
}: {
  value: File | null;
  onChange: (f: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const preview = value ? URL.createObjectURL(value) : null;

  const handleFile = useCallback(
    (f: File | undefined) => {
      if (f && f.type.startsWith("image/")) onChange(f);
    },
    [onChange]
  );

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-slate-700">Ảnh đại diện</label>
      <div
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFile(e.dataTransfer.files[0]);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onClick={() => !value && inputRef.current?.click()}
        className={cn(
          "relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all",
          "min-h-35 overflow-hidden bg-slate-50",
          dragging
            ? "border-[#A8E6CF] bg-[#A8E6CF]/10"
            : value
            ? "cursor-default border-[#A8E6CF]/40 bg-[#A8E6CF]/5"
            : "border-slate-200 hover:border-slate-300 hover:bg-slate-100"
        )}
      >
        {value && preview ? (
          <div className="relative h-full w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Preview" className="h-34.5 w-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity hover:opacity-100">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(null);
                }}
                className="flex items-center gap-1.5 rounded-lg bg-white/20 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm hover:bg-white/30"
              >
                <X className="h-3 w-3" />
                Xóa ảnh
              </button>
            </div>
            <button
              type="button"
              className="absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#2c5243] shadow-md"
              onClick={(e) => {
                e.stopPropagation();
                inputRef.current?.click();
              }}
            >
              <Camera className="h-3.5 w-3.5 text-white" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 px-6 py-6 text-center">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full",
                dragging ? "bg-[#A8E6CF]/40 text-[#1c362b]" : "bg-white text-slate-400 shadow-sm border border-slate-100"
              )}
            >
              <Upload className="h-4.5 w-4.5" />
            </div>
            <p className="text-xs font-medium text-slate-500">
              {dragging ? "Thả ảnh vào đây..." : "Kéo thả hoặc nhấn để chọn ảnh"}
            </p>
            <p className="text-[10px] text-slate-400">PNG, JPG, WEBP · Tối đa 5MB</p>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>
    </div>
  );
}

// ─── Shared form input ──────────────────────────────────────────────────────

const INPUT_CLASS = cn(
  "h-11 w-full rounded-lg border bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm",
  "transition-all outline-none",
  "focus:ring-2",
  "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
);

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <motion.p
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-1 text-xs font-medium text-red-500"
    >
      {message}
    </motion.p>
  );
}

// ─── Step Animation Wrapper ─────────────────────────────────────────────────

const slideVariants = {
  enter: { opacity: 0, x: 40 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
};

function StepWrapper({ stepKey, children }: { stepKey: string; children: React.ReactNode }) {
  return (
    <motion.div
      key={stepKey}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.35, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}

// ─── Main Page Component ────────────────────────────────────────────────────

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);

  // ── Step 1 state
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginErrors, setLoginErrors] = useState<FieldErrors>({});

  // ── Step 2 state
  const [pwForm, setPwForm] = useState({ current: "", newPass: "", confirm: "" });
  const [showPw, setShowPw] = useState({ current: false, newPass: false, confirm: false });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwErrors, setPwErrors] = useState<FieldErrors>({});

  // ── Step 3 state
  const [profileForm, setProfileForm] = useState({ fullName: "", phone: "" });
  const [avatar, setAvatar] = useState<File | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileErrors, setProfileErrors] = useState<FieldErrors>({});

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: FieldErrors = {};

    if (!loginForm.email.trim()) errors.email = "Email không được để trống.";
    else if (!/\S+@\S+\.\S+/.test(loginForm.email)) errors.email = "Email không hợp lệ.";
    if (!loginForm.password.trim()) errors.password = "Mật khẩu không được để trống.";

    if (Object.keys(errors).length > 0) {
      setLoginErrors(errors);
      return;
    }

    setLoginErrors({});
    setLoginLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoginLoading(false);

    // Simulate first-login detection
    const isFirstLogin = loginForm.password === "temp123";
    if (isFirstLogin) {
      setStep(2);
    } else {
      router.push("/eco-fashion/business");
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: FieldErrors = {};

    if (!pwForm.current.trim()) errors.current = "Vui lòng nhập mật khẩu tạm thời.";
    if (!pwForm.newPass.trim()) errors.newPass = "Vui lòng nhập mật khẩu mới.";
    else if (pwForm.newPass.length < 8) errors.newPass = "Mật khẩu mới tối thiểu 8 ký tự.";
    if (!pwForm.confirm.trim()) errors.confirm = "Vui lòng xác nhận mật khẩu mới.";
    else if (pwForm.confirm !== pwForm.newPass) errors.confirm = "Mật khẩu xác nhận không khớp.";

    if (Object.keys(errors).length > 0) {
      setPwErrors(errors);
      return;
    }

    setPwErrors({});
    setPwLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setPwLoading(false);
    setStep(3);
  };

  const handleProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: FieldErrors = {};

    if (!profileForm.fullName.trim()) errors.fullName = "Họ và tên không được để trống.";
    if (!profileForm.phone.trim()) errors.phone = "Số điện thoại không được để trống.";
    else if (!/^0\d{9}$/.test(profileForm.phone.replace(/\s/g, "")))
      errors.phone = "Số điện thoại không hợp lệ (VD: 0912345678).";

    if (Object.keys(errors).length > 0) {
      setProfileErrors(errors);
      return;
    }

    setProfileErrors({});
    setProfileLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setProfileLoading(false);
    setStep(4);
    setTimeout(() => router.push("/eco-fashion/business"), 2500);
  };

  // ── Form Input classes
  const inputCls = cn(INPUT_CLASS, "border-slate-200 focus:border-[#A8E6CF] focus:ring-[#A8E6CF]/30");
  const inputErrorCls = "border-red-300 focus:border-red-500 focus:ring-red-500/20";

  return (
    <>
      <StepIndicator current={step} />

      <AnimatePresence mode="wait">
        {/* ═══ STEP 1: LOGIN ═══ */}
        {step === 1 && (
          <StepWrapper stepKey="login">
            <div className="mb-6">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Đăng nhập</h1>
              <p className="mt-1 text-sm text-slate-500">
                Nhập email và mật khẩu đã được cung cấp qua email
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-200/50">
              <form onSubmit={handleLogin} className="space-y-4" noValidate>
                {/* Email */}
                <div className="space-y-1.5">
                  <label htmlFor="login-email" className="text-sm font-semibold text-slate-700">
                    Email
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@company.com"
                    value={loginForm.email}
                    onChange={(e) => {
                      setLoginForm((p) => ({ ...p, email: e.target.value }));
                      if (loginErrors.email) setLoginErrors((p) => ({ ...p, email: "" }));
                    }}
                    disabled={loginLoading}
                    className={cn(inputCls, loginErrors.email && inputErrorCls)}
                  />
                  <FieldError message={loginErrors.email} />
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="login-password" className="text-sm font-semibold text-slate-700">
                      Mật khẩu
                    </label>
                    <Link
                      href="/forgot-password"
                      className="text-xs text-[#2c5243] transition-colors hover:underline"
                    >
                      Quên mật khẩu?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      id="login-password"
                      type={showLoginPass ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      value={loginForm.password}
                      onChange={(e) => {
                        setLoginForm((p) => ({ ...p, password: e.target.value }));
                        if (loginErrors.password) setLoginErrors((p) => ({ ...p, password: "" }));
                      }}
                      disabled={loginLoading}
                      className={cn(inputCls, "pr-11", loginErrors.password && inputErrorCls)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPass(!showLoginPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      aria-label={showLoginPass ? "Ẩn" : "Hiện"}
                    >
                      {showLoginPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <FieldError message={loginErrors.password} />
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className={cn(
                    "relative mt-2 h-11 w-full overflow-hidden rounded-lg text-sm font-semibold text-[#1c362b] transition-all",
                    "bg-[#A8E6CF] hover:bg-[#97d0ba] shadow-sm hover:shadow",
                    "active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                  )}
                >
                  {loginLoading ? (
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

              <div className="mt-6 flex flex-col items-center justify-center gap-3">
                <p className="text-center text-sm text-slate-500">
                  Chưa có tài khoản?{" "}
                  <Link href="/register" className="font-semibold text-[#2c5243] hover:underline">
                    Đăng ký doanh nghiệp
                  </Link>
                </p>
                <p className="text-[10px] text-slate-400">
                  Bằng cách đăng nhập, bạn đồng ý với{" "}
                  <Link href="#" className="underline hover:text-slate-500">
                    Điều khoản dịch vụ
                  </Link>
                </p>
              </div>
            </div>
          </StepWrapper>
        )}

        {/* ═══ STEP 2: FORCE PASSWORD RESET ═══ */}
        {step === 2 && (
          <StepWrapper stepKey="password">
            <div className="mb-6">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[#A8E6CF]/30">
                <Lock className="h-5 w-5 text-[#2c5243]" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Đổi mật khẩu</h1>
              <p className="mt-1 text-sm text-slate-500">
                Bạn đang dùng mật khẩu tạm. Hãy đặt mật khẩu mới ngay bây giờ.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-200/50">
              <form onSubmit={handlePasswordReset} className="space-y-4" noValidate>
                {[
                  { key: "current" as const, label: "Mật khẩu tạm thời", auto: "current-password" },
                  { key: "newPass" as const, label: "Mật khẩu mới", auto: "new-password" },
                  { key: "confirm" as const, label: "Xác nhận mật khẩu mới", auto: "new-password" },
                ].map(({ key, label, auto }) => (
                  <div key={key} className="space-y-1.5">
                    <label htmlFor={`pw-${key}`} className="text-sm font-semibold text-slate-700">
                      {label}
                    </label>
                    <div className="relative">
                      <input
                        id={`pw-${key}`}
                        type={showPw[key] ? "text" : "password"}
                        autoComplete={auto}
                        placeholder="••••••••"
                        value={pwForm[key]}
                        onChange={(e) => {
                          setPwForm((p) => ({ ...p, [key]: e.target.value }));
                          if (pwErrors[key]) setPwErrors((p) => ({ ...p, [key]: "" }));
                        }}
                        disabled={pwLoading}
                        className={cn(inputCls, "pr-11", pwErrors[key] && inputErrorCls)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw((p) => ({ ...p, [key]: !p[key] }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPw[key] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <FieldError message={pwErrors[key]} />

                    {key === "newPass" && pwForm.newPass && (
                      <PasswordStrength password={pwForm.newPass} />
                    )}
                    {key === "confirm" && pwForm.confirm && pwForm.newPass && (
                      <p
                        className={cn(
                          "mt-1 text-[11px] font-medium",
                          pwForm.confirm === pwForm.newPass ? "text-[#5a9c82]" : "text-red-500"
                        )}
                      >
                        {pwForm.confirm === pwForm.newPass ? "✓ Mật khẩu khớp" : "✗ Mật khẩu chưa khớp"}
                      </p>
                    )}
                  </div>
                ))}

                <button
                  type="submit"
                  disabled={pwLoading}
                  className={cn(
                    "relative mt-2 h-11 w-full overflow-hidden rounded-lg text-sm font-semibold text-[#1c362b] transition-all",
                    "bg-[#A8E6CF] hover:bg-[#97d0ba] shadow-sm hover:shadow",
                    "active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                  )}
                >
                  {pwLoading ? (
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
          </StepWrapper>
        )}

        {/* ═══ STEP 3: COMPLETE PROFILE ═══ */}
        {step === 3 && (
          <StepWrapper stepKey="profile">
            <div className="mb-6">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[#A8E6CF]/30">
                <User className="h-5 w-5 text-[#2c5243]" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Hoàn thiện hồ sơ</h1>
              <p className="mt-1 text-sm text-slate-500">
                Thông tin này sẽ hiển thị trên Dashboard của bạn
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-200/50">
              <form onSubmit={handleProfile} className="space-y-4" noValidate>
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label htmlFor="profile-name" className="text-sm font-semibold text-slate-700">
                    Họ và Tên <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="profile-name"
                      type="text"
                      autoComplete="name"
                      placeholder="Nguyễn Văn A"
                      value={profileForm.fullName}
                      onChange={(e) => {
                        setProfileForm((p) => ({ ...p, fullName: e.target.value }));
                        if (profileErrors.fullName) setProfileErrors((p) => ({ ...p, fullName: "" }));
                      }}
                      disabled={profileLoading}
                      className={cn(inputCls, "pl-10", profileErrors.fullName && inputErrorCls)}
                    />
                  </div>
                  <FieldError message={profileErrors.fullName} />
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label htmlFor="profile-phone" className="text-sm font-semibold text-slate-700">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="profile-phone"
                      type="tel"
                      autoComplete="tel"
                      placeholder="0912 345 678"
                      value={profileForm.phone}
                      onChange={(e) => {
                        setProfileForm((p) => ({ ...p, phone: e.target.value }));
                        if (profileErrors.phone) setProfileErrors((p) => ({ ...p, phone: "" }));
                      }}
                      disabled={profileLoading}
                      className={cn(inputCls, "pl-10", profileErrors.phone && inputErrorCls)}
                    />
                  </div>
                  <FieldError message={profileErrors.phone} />
                </div>

                {/* Avatar */}
                <AvatarDropzone value={avatar} onChange={setAvatar} />

                <button
                  type="submit"
                  disabled={profileLoading}
                  className={cn(
                    "relative mt-2 h-11 w-full overflow-hidden rounded-lg text-sm font-semibold text-[#1c362b] transition-all",
                    "bg-[#A8E6CF] hover:bg-[#97d0ba] shadow-sm hover:shadow",
                    "active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                  )}
                >
                  {profileLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Đang lưu hồ sơ...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Hoàn tất
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  )}
                </button>

                <p className="text-center text-[10px] text-slate-400">
                  Bạn có thể cập nhật thông tin này bất cứ lúc nào trong phần Cài đặt
                </p>
              </form>
            </div>
          </StepWrapper>
        )}

        {/* ═══ STEP 4: SUCCESS ═══ */}
        {step === 4 && (
          <StepWrapper stepKey="success">
            <div className="flex flex-col items-center py-12 text-center">
              {/* Animated check */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#A8E6CF]/30"
              >
                <CheckCircle2 className="h-10 w-10 text-[#2c5243]" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="mb-1 flex items-center justify-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-500" />
                  <h1 className="text-2xl font-bold text-slate-900">Chào mừng đến với hệ thống!</h1>
                  <Sparkles className="h-5 w-5 text-amber-500" />
                </div>
                <p className="mt-2 text-sm text-slate-500">
                  Tài khoản của bạn đã được thiết lập hoàn tất.
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Đang chuyển hướng đến Dashboard...
                </p>
              </motion.div>

              {/* Loading dots */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-8 flex items-center gap-1.5"
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="h-2 w-2 rounded-full bg-[#5a9c82]"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </motion.div>
            </div>
          </StepWrapper>
        )}
      </AnimatePresence>
    </>
  );
}
