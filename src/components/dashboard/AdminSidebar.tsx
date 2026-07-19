"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  CreditCard,
  Settings,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  FileText,
  BarChart3,
  Users,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string | number;
};

const NAV_ITEMS: NavItem[] = [
  {
    label: "Tổng quan",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Doanh nghiệp",
    href: "/admin/tenants",
    icon: Building2,
  },
  {
    label: "Người dùng",
    href: "/admin/users",
    icon: Users,
  },
  {
    label: "Gói cước",
    href: "/admin/plans",
    icon: CreditCard,
  },
  {
    label: "Quota & Tài nguyên",
    href: "/admin/quota",
    icon: BarChart3,
  },
  {
    label: "Chính sách",
    href: "/admin/policies",
    icon: FileText,
  },
  {
    label: "Cài đặt",
    href: "/admin/settings",
    icon: Settings,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "hidden shrink-0 border-r border-[#1c362b] bg-[#0f1f18] text-slate-100 transition-all duration-300 md:flex md:flex-col",
        collapsed ? "w-17" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-[#1c362b] px-4">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#5a9c82] to-[#2c5243]">
            <ShoppingBag className="h-4 w-4 text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-bold tracking-tight text-white">
                Smart Shopping
              </p>
              <p className="text-[10px] font-medium uppercase tracking-widest text-[#86d9b0]">
                SaaS Admin
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-[#2c5243]/40 text-white"
                  : "text-slate-400 hover:bg-[#2c5243]/20 hover:text-white"
              )}
            >
              <Icon
                className={cn(
                  "h-4.5 w-4.5 shrink-0 transition-colors",
                  isActive ? "text-[#86d9b0]" : "text-slate-500 group-hover:text-slate-300"
                )}
              />
              {!collapsed && (
                <>
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.badge && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#86d9b0]/20 px-1.5 text-[10px] font-bold text-[#86d9b0]">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-[#1c362b] p-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-center gap-2 rounded-lg py-2 text-xs text-slate-500 transition-colors hover:bg-[#2c5243]/20 hover:text-slate-300"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          {!collapsed && <span>Thu gọn</span>}
        </button>
      </div>
    </aside>
  );
}
