// (auth)/layout.tsx
// Layout cho toàn bộ auth pages: login, register, forgot-password
// Không có sidebar/header — chỉ là centered card layout

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Đăng nhập", template: "%s | Smart Shopping" },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="w-full max-w-md px-4">
        {children}
      </div>
    </div>
  );
}
