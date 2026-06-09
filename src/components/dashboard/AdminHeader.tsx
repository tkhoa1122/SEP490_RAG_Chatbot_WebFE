"use client";

import { Search, Bell, LogOut, User, ChevronDown, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

export function AdminHeader() {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-background px-6">
      {/* Left: Mobile menu + Search */}
      <div className="flex items-center gap-3">
        <button className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted md:hidden">
          <Menu className="h-5 w-5" />
        </button>

        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm kiếm doanh nghiệp, gói cước..."
            className={cn(
              "h-9 w-[280px] rounded-lg border border-border bg-muted/40 pl-9 pr-4 text-sm text-foreground",
              "outline-none transition-all placeholder:text-muted-foreground/60",
              "focus:w-[360px] focus:border-ring focus:bg-background focus:ring-2 focus:ring-ring/20"
            )}
          />
        </div>
      </div>

      {/* Right: Notifications + Profile */}
      <div className="flex items-center gap-2">
        {/* Notification bell */}
        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-background" />
        </button>

        {/* Divider */}
        <div className="mx-1 h-6 w-px bg-border" />

        {/* Profile dropdown */}
        <button className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-800 text-xs font-bold text-white">
            <User className="h-4 w-4" />
          </div>
          <div className="hidden text-left sm:block">
            <p className="text-sm font-medium leading-tight text-foreground">System Admin</p>
            <p className="text-[11px] text-muted-foreground">admin@smartshop.vn</p>
          </div>
          <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground sm:block" />
        </button>

        {/* Logout */}
        <button
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          aria-label="Đăng xuất"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
