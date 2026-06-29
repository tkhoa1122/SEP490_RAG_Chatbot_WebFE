// (dashboard)/layout.tsx
// Guard Layer 2 cho toàn bộ dashboard (business + admin)
// Middleware đã check token + role, layout này verify thêm từ server-side
// và render Sidebar + Header chung

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { BusinessSidebar } from "@/components/dashboard/BusinessSidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  params: Promise<{ tenant_id: string }>;
}

export default async function DashboardLayout({ children, params }: DashboardLayoutProps) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  const { tenant_id } = await params;

  // TẠM THỜI TẮT AUTH ĐỂ LÀM UX/UI
  // if (!token) {
  //   redirect("/login?reason=SESSION_EXPIRED");
  // }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <BusinessSidebar tenantId={tenant_id} />

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header — TODO: DashboardHeader component */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b bg-card px-6">
          <span className="text-sm font-medium text-muted-foreground">Dashboard</span>
          {/* Avatar, notifications... */}
        </header>
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
