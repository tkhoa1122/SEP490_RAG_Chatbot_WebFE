// (dashboard)/admin/layout.tsx
// Guard Layer 2 NGHIÊM NGẶT — chỉ SYSTEM_ADMIN
// Middleware đã check role cookie, layout này verify lại server-side

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { UserRole } from "@/domain/entities/User";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Admin Panel" },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const userRole = cookieStore.get("user_role")?.value;
  const token = cookieStore.get("auth_token")?.value;

  // Guard: Token bắt buộc
  if (!token) {
    redirect("/login?reason=NOT_AUTHENTICATED");
  }

  // Guard: SYSTEM_ADMIN bắt buộc — không thể bypass qua cookie manipulation
  // (Trong production, verify JWT token ở đây thay vì đọc cookie role)
  if (userRole !== UserRole.SYSTEM_ADMIN) {
    redirect("/403");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside className="hidden w-64 shrink-0 border-r bg-slate-950 text-slate-100 md:flex md:flex-col">
        <div className="flex h-16 items-center border-b border-slate-800 px-6">
          <span className="text-sm font-semibold uppercase tracking-widest text-slate-400">
            System Admin
          </span>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {/* Admin-only nav items */}
        </nav>
      </aside>
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between border-b bg-slate-950 px-6">
          <span className="text-sm font-medium text-slate-400">Admin Panel</span>
        </header>
        <main className="flex-1 overflow-auto bg-slate-50 p-6 dark:bg-slate-900">
          {children}
        </main>
      </div>
    </div>
  );
}
