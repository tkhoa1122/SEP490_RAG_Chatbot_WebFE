import type { Metadata } from "next";

export const metadata: Metadata = { title: "Đăng nhập" };

// LoginPage — UI stub, sẽ dùng useAuth hook từ application layer
// Middleware đã đảm bảo user chưa đăng nhập khi vào đây
export default function LoginPage() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-white">Đăng nhập</h1>
        <p className="mt-1 text-sm text-slate-400">Smart Shopping Chatbot</p>
      </div>
      {/* TODO: LoginForm component */}
      <p className="text-center text-sm text-slate-500">Form đăng nhập sẽ được xây dựng ở đây</p>
    </div>
  );
}
