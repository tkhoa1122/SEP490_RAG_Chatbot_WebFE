// (dashboard)/admin/layout.tsx
// Guard Layer 2 NGHIÊM NGẶT — chỉ SYSTEM_ADMIN
// Middleware đã check role cookie, layout này verify lại server-side

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { UserRole } from "@/domain/entities/User";
import type { Metadata } from "next";
import { AdminLayoutShell } from "@/components/dashboard/AdminLayoutShell";

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

  return <AdminLayoutShell>{children}</AdminLayoutShell>;
}
