import type { Metadata } from "next";

export const metadata: Metadata = { title: "Đăng ký" };

export default function RegisterPage() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
      <h1 className="mb-6 text-center text-2xl font-bold text-white">Đăng ký tài khoản</h1>
      {/* TODO: RegisterForm component */}
      <p className="text-center text-sm text-slate-500">Form đăng ký sẽ được xây dựng ở đây</p>
    </div>
  );
}
