import type { Metadata } from "next";

export const metadata: Metadata = { title: "Quên mật khẩu" };

export default function ForgotPasswordPage() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
      <h1 className="mb-6 text-center text-2xl font-bold text-white">Quên mật khẩu</h1>
      {/* TODO: ForgotPasswordForm component */}
      <p className="text-center text-sm text-slate-500">Form khôi phục mật khẩu sẽ được xây dựng ở đây</p>
    </div>
  );
}
