// (dashboard)/layout.tsx
// Guard Layer 2 cho toàn bộ dashboard (business + admin)
// Middleware đã check token + role, layout này verify thêm từ server-side
// và render Sidebar + Header chung

import { redirect } from "next/navigation";
import { cookies } from "next/headers";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  // Double-check: nếu không có token → redirect login
  // (Middleware là Guard 1, layout này là Guard 2 — defense in depth)
  if (!token) {
    redirect("/login?reason=SESSION_EXPIRED");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar — TODO: DashboardSidebar component với conditional nav items */}
      <aside className="hidden w-64 shrink-0 border-r bg-card md:flex md:flex-col">
        <div className="flex h-16 items-center border-b px-6">
          <span className="text-lg font-semibold tracking-tight">Smart Shopping</span>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {/* Nav items sẽ render có điều kiện theo role */}
        </nav>
      </aside>

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
