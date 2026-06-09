"use client";

import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Phone, Upload, X, Loader2, CheckCircle2, ArrowRight, Camera } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Avatar Upload Drop Zone ─────────────────────────────────────────────────

interface AvatarUploadProps {
  value: File | null;
  onChange: (file: File | null) => void;
}

function AvatarUpload({ value, onChange }: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const preview = value ? URL.createObjectURL(value) : null;

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    onChange(file);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }, []);

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-slate-300">Ảnh đại diện</label>

      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={() => setIsDragging(false)}
        onClick={() => !value && inputRef.current?.click()}
        className={cn(
          "relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all duration-200",
          "min-h-[160px] overflow-hidden",
          isDragging
            ? "border-violet-500 bg-violet-500/10"
            : value
            ? "border-emerald-500/40 bg-emerald-500/5 cursor-default"
            : "border-white/15 bg-white/3 hover:border-white/30 hover:bg-white/5"
        )}
      >
        <AnimatePresence mode="wait">
          {value && preview ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative h-full w-full"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="Avatar preview"
                className="h-[158px] w-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity hover:opacity-100">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(null);
                  }}
                  className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                >
                  <X className="h-3.5 w-3.5" />
                  Xóa ảnh
                </button>
              </div>
              <div
                className="absolute bottom-2 right-2 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  inputRef.current?.click();
                }}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-600 shadow-lg">
                  <Camera className="h-4 w-4 text-white" />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3 px-6 py-8 text-center"
            >
              <div className={cn(
                "flex h-12 w-12 items-center justify-center rounded-full transition-colors",
                isDragging ? "bg-violet-500/20 text-violet-400" : "bg-white/8 text-slate-400"
              )}>
                <Upload className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-300">
                  {isDragging ? "Thả ảnh vào đây..." : "Kéo thả hoặc nhấn để chọn ảnh"}
                </p>
                <p className="mt-1 text-xs text-slate-500">PNG, JPG, WEBP · Tối đa 5MB</p>
              </div>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="rounded-lg border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-slate-300 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
              >
                Chọn ảnh
              </button>
            </motion.div>
          )}
        </AnimatePresence>

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

// ─── Complete Profile Form ────────────────────────────────────────────────────

interface CompleteProfileFormProps {
  onSuccess?: () => void;
}

export function CompleteProfileForm({ onSuccess }: CompleteProfileFormProps) {
  const [form, setForm] = useState({ fullName: "", phone: "" });
  const [avatar, setAvatar] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDone, setIsDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.fullName.trim()) {
      setError("Vui lòng nhập họ và tên của bạn.");
      return;
    }
    if (!form.phone.trim()) {
      setError("Vui lòng nhập số điện thoại.");
      return;
    }

    setIsLoading(true);
    await new Promise((res) => setTimeout(res, 1800));
    setIsLoading(false);
    setIsDone(true);
    setTimeout(() => onSuccess?.(), 1200);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30">
          <User className="h-7 w-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Hoàn thiện hồ sơ</h1>
        <p className="mt-1.5 text-sm text-slate-400">
          Giúp chúng tôi nhận biết bạn. Thông tin này sẽ hiển thị trên Dashboard.
        </p>
      </div>

      {/* Step indicator */}
      <div className="mb-6 flex items-center justify-center gap-2">
        {["Đăng nhập", "Đổi mật khẩu", "Hồ sơ"].map((step, i) => (
          <React.Fragment key={step}>
            <div className={cn(
              "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-all",
              i === 2
                ? isDone ? "bg-emerald-500 text-white" : "bg-violet-500 text-white"
                : "bg-emerald-500 text-white"
            )}>
              {i < 2 || isDone ? "✓" : i + 1}
            </div>
            {i < 2 && <div className="h-px w-8 bg-emerald-500" />}
          </React.Fragment>
        ))}
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
        <AnimatePresence mode="wait">
          {isDone ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-4 py-8 text-center"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
                <CheckCircle2 className="h-8 w-8 text-emerald-400" />
              </div>
              <div>
                <p className="text-lg font-semibold text-white">Hoàn tất!</p>
                <p className="mt-1 text-sm text-slate-400">Đang chuyển hướng đến Dashboard...</p>
              </div>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              onSubmit={handleSubmit}
              className="space-y-5"
              noValidate
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
                >
                  {error}
                </motion.div>
              )}

              {/* Full Name */}
              <div className="space-y-1.5">
                <label htmlFor="fullName" className="text-sm font-medium text-slate-300">
                  Họ và Tên <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    id="fullName"
                    type="text"
                    autoComplete="name"
                    placeholder="Nguyễn Văn A"
                    value={form.fullName}
                    onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                    disabled={isLoading}
                    className={cn(
                      "h-11 w-full rounded-lg border border-white/10 bg-white/5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500",
                      "transition-all outline-none",
                      "focus:border-violet-500/60 focus:bg-white/8 focus:ring-2 focus:ring-violet-500/20",
                      "disabled:cursor-not-allowed disabled:opacity-50"
                    )}
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label htmlFor="phone" className="text-sm font-medium text-slate-300">
                  Số điện thoại <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    id="phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="0912 345 678"
                    value={form.phone}
                    onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                    disabled={isLoading}
                    className={cn(
                      "h-11 w-full rounded-lg border border-white/10 bg-white/5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500",
                      "transition-all outline-none",
                      "focus:border-violet-500/60 focus:bg-white/8 focus:ring-2 focus:ring-violet-500/20",
                      "disabled:cursor-not-allowed disabled:opacity-50"
                    )}
                  />
                </div>
              </div>

              {/* Avatar Upload */}
              <AvatarUpload value={avatar} onChange={setAvatar} />

              <button
                type="submit"
                disabled={isLoading}
                className={cn(
                  "relative h-11 w-full overflow-hidden rounded-lg text-sm font-semibold text-white transition-all",
                  "bg-gradient-to-r from-violet-600 to-purple-600",
                  "hover:from-violet-500 hover:to-purple-500 hover:shadow-lg hover:shadow-violet-500/25",
                  "active:scale-[0.98]",
                  "disabled:cursor-not-allowed disabled:opacity-60"
                )}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang lưu hồ sơ...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Vào Dashboard
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </button>

              <p className="text-center text-xs text-slate-500">
                Bạn có thể cập nhật thông tin này bất cứ lúc nào trong phần Cài đặt
              </p>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
