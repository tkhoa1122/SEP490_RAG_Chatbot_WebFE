"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, Store, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { businessAPI } from "@/infrastructure/api/businessAPI";

// ─── Input Component (Light Theme) ──────────────────────────────────────────

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

export default function RegisterPage() {
  const [form, setForm] = useState({
    businessName: "",
    fullName: "",
    email: "",
    hotLine: "",
    websiteUrl: "",
    addressLine: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!form.businessName.trim()) newErrors.businessName = "Vui lòng nhập tên cửa hàng.";
    if (!form.fullName.trim()) newErrors.fullName = "Vui lòng nhập họ và tên.";
    if (!form.email.trim()) newErrors.email = "Vui lòng nhập email.";
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Email không hợp lệ.";

    if (form.hotLine.trim() && !/^[0-9]{10,11}$/.test(form.hotLine.trim())) {
      newErrors.hotLine = "Số điện thoại không hợp lệ (10-11 số).";
    }
    if (form.websiteUrl.trim() && !/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i.test(form.websiteUrl.trim())) {
      newErrors.websiteUrl = "URL website không hợp lệ.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      try {
        const payload: any = {
          businessName: form.businessName,
          businessOwnerName: form.fullName,
          businessOwnerEmail: form.email,
        };
        if (form.hotLine.trim()) payload.hotLine = form.hotLine.trim();
        if (form.websiteUrl.trim()) payload.websiteUrl = form.websiteUrl.trim();
        if (form.addressLine.trim()) payload.addressLine = form.addressLine.trim();

        await businessAPI.create(payload);
        setIsSuccess(true);
      } catch (err: any) {
        const errorMsg = err.response?.data?.message || err.message || "Đăng ký thất bại, vui lòng thử lại sau.";
        setErrors(prev => ({ ...prev, email: errorMsg }));
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) {
      setErrors((p) => ({ ...p, [name]: "" }));
    }
  };

  if (isSuccess) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center text-center space-y-4"
      >
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#A8E6CF]/30">
          <CheckCircle2 className="h-10 w-10 text-[#2c5243]" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Đăng ký thành công!</h2>
        <p className="text-sm text-slate-500 max-w-[300px]">
          Tài khoản doanh nghiệp của bạn đã được tạo và đang chờ Admin duyệt. Bạn sẽ nhận được email thông báo ngay khi được cấp quyền.
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
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="w-full"
    >
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Đăng ký Doanh nghiệp</h1>
        <p className="mt-1 text-sm text-slate-500">
          Điền thông tin bên dưới để khởi tạo cửa hàng của bạn
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-200/50">
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          
          <div className="space-y-1.5">
            <Label htmlFor="businessName">Tên cửa hàng</Label>
            <Input
              id="businessName"
              name="businessName"
              placeholder="VD: Eco Fashion"
              value={form.businessName}
              onChange={handleChange}
              error={!!errors.businessName}
              disabled={isLoading}
            />
            {errors.businessName && <p className="mt-1 text-xs font-medium text-red-500">{errors.businessName}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="fullName">Họ và tên chủ sở hữu</Label>
            <Input
              id="fullName"
              name="fullName"
              placeholder="VD: Trần Nhung"
              value={form.fullName}
              onChange={handleChange}
              error={!!errors.fullName}
              disabled={isLoading}
            />
            {errors.fullName && <p className="mt-1 text-xs font-medium text-red-500">{errors.fullName}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email quản trị</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="admin@ecofashion.com"
              value={form.email}
              onChange={handleChange}
              error={!!errors.email}
              disabled={isLoading}
            />
            {errors.email && <p className="mt-1 text-xs font-medium text-red-500">{errors.email}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="hotLine">Hotline (Tùy chọn)</Label>
            <Input
              id="hotLine"
              name="hotLine"
              placeholder="VD: 0912345678"
              value={form.hotLine}
              onChange={handleChange}
              error={!!errors.hotLine}
              disabled={isLoading}
            />
            {errors.hotLine && <p className="mt-1 text-xs font-medium text-red-500">{errors.hotLine}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="websiteUrl">URL Website (Tùy chọn)</Label>
            <Input
              id="websiteUrl"
              name="websiteUrl"
              placeholder="VD: https://ecofashion.com"
              value={form.websiteUrl}
              onChange={handleChange}
              error={!!errors.websiteUrl}
              disabled={isLoading}
            />
            {errors.websiteUrl && <p className="mt-1 text-xs font-medium text-red-500">{errors.websiteUrl}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="addressLine">Địa chỉ (Tùy chọn)</Label>
            <Input
              id="addressLine"
              name="addressLine"
              placeholder="VD: 123 Nguyễn Văn Cừ, Q5, TP.HCM"
              value={form.addressLine}
              onChange={handleChange}
              error={!!errors.addressLine}
              disabled={isLoading}
            />
            {errors.addressLine && <p className="mt-1 text-xs font-medium text-red-500">{errors.addressLine}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="relative mt-2 flex h-11 w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-[#A8E6CF] text-sm font-semibold text-[#1c362b] shadow-sm transition-all hover:bg-[#97d0ba] hover:shadow disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <Store className="h-4 w-4" />
                Đăng ký doanh nghiệp
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          Đã có tài khoản?{" "}
          <Link href="/login" className="font-semibold text-[#2c5243] hover:underline">
            Đăng nhập tại đây
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
