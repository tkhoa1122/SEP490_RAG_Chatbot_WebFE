"use client";

import React from "react";
import { cn } from "@/lib/utils";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Left Panel — Branding / Illustration */}
      <div className="relative hidden w-[45%] flex-col justify-between overflow-hidden bg-gradient-to-br from-[#A8E6CF] via-[#8fd4ba] to-[#5a9c82] p-10 lg:flex">
        
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-black/5 blur-3xl" />
        
        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#2c5243] shadow-lg">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight text-[#1c362b]">
                Smart Shopping
              </p>
              <p className="text-[11px] font-medium uppercase tracking-widest text-[#2c5243]/70">
                SaaS Platform
              </p>
            </div>
          </div>
        </div>

        {/* Center — Hero text */}
        <div className="relative z-10 -mt-12">
          <h2 className="max-w-md text-4xl font-bold leading-tight tracking-tight text-[#1c362b]">
            Bắt đầu xây dựng <br/>
            <span className="text-white">Cửa hàng AI</span> của bạn ngay hôm nay.
          </h2>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-[#2c5243]">
            Tự động hóa chăm sóc khách hàng, tư vấn sản phẩm và tăng doanh thu với chatbot AI được thiết kế riêng cho doanh nghiệp của bạn.
          </p>

          {/* Feature pills */}
          <div className="mt-8 flex flex-wrap gap-2">
            {["Không cần code", "Setup nhanh chóng", "Hỗ trợ 24/7", "Tăng doanh thu 35%"].map((feat) => (
              <span key={feat} className="rounded-full border border-[#1c362b]/10 bg-white/20 px-3 py-1.5 text-xs font-medium text-[#1c362b] backdrop-blur-sm">
                {feat}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom — Empty space for balance, or testimonial */}
        <div className="relative z-10">
          {/* Kept empty to match the clean aesthetic */}
        </div>
      </div>

      {/* Right Panel — Form Content (Light Theme) */}
      <div className="flex flex-1 flex-col bg-slate-50">
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="w-full max-w-[440px]">{children}</div>
        </div>
      </div>
    </div>
  );
}
