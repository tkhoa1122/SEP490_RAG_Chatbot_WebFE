"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Box,
  Settings,
  BarChart,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
  Store,
  Users,
  Key,
  MessageSquare,
  Activity,
  Bot,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { getRoleFromCookie } from "@/infrastructure/api/mainAuthAPI";

type NavItem = {
  label: string;
  href: (tenantId: string) => string;
  icon: LucideIcon;
  allowedRoles?: string[];
};

const NAV_ITEMS: NavItem[] = [
  {
    label: "Tổng quan",
    href: (t) => `/${t}/business`,
    icon: LayoutDashboard,
  },
  {
    label: "Nhân sự",
    href: (t) => `/${t}/business/team`,
    icon: Users,
    allowedRoles: ["BUSINESS_OWNER"],
  },
  {
    label: "Sản phẩm",
    href: (t) => `/${t}/business/products`,
    icon: Box,
  },
  {
    label: "Lịch sử Chat",
    href: (t) => `/${t}/business/chat-logs`,
    icon: MessageSquare,
  },
  {
    label: "Kho tri thức",
    href: (t) => `/${t}/business/catalog`,
    icon: Store,
  },
  {
    label: "Thanh toán",
    href: (t) => `/${t}/business/billing`,
    icon: CreditCard,
    allowedRoles: ["BUSINESS_OWNER"],
  },


  {
    label: "API Keys",
    href: (t) => `/${t}/business/api-keys`,
    icon: Key,
    allowedRoles: ["BUSINESS_OWNER"],
  },
  {
    label: "Cấu hình AI",
    href: (t) => `/${t}/business/chatbot-config`,
    icon: Bot,
    allowedRoles: ["BUSINESS_OWNER"],
  },
  {
    label: "Cài đặt",
    href: (t) => `/${t}/business/settings`,
    icon: Settings,
    allowedRoles: ["BUSINESS_OWNER"],
  },
];

export function BusinessSidebar({ tenantId }: { tenantId: string }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [userRole, setUserRole] = useState<string>("");

  useEffect(() => {
    setUserRole(getRoleFromCookie() || "");
  }, []);

  return (
    <aside
      className={cn(
        "hidden shrink-0 border-r bg-card text-foreground transition-all duration-300 md:flex md:flex-col",
        collapsed ? "w-17" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-4">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
            <Store className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-bold tracking-tight">
                Dashboard
              </p>
              <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                Quản lý Cửa Hàng
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const href = item.href(tenantId);
          // Match exact path for overview, prefix for others
          const isActive =
            pathname === href || (href !== `/${tenantId}/business` && pathname.startsWith(href));
            
          const isAllowed = !item.allowedRoles || item.allowedRoles.includes(userRole);

          if (!isAllowed) {
            return (
              <div
                key={href}
                title="Tính năng chỉ dành cho Chủ doanh nghiệp"
                className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium opacity-50 cursor-not-allowed text-muted-foreground"
              >
                <Icon className="h-4.5 w-4.5 shrink-0 text-muted-foreground" />
                {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                {!collapsed && <Lock className="h-3.5 w-3.5 ml-auto text-muted-foreground" />}
              </div>
            );
          }

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon
                className={cn(
                  "h-4.5 w-4.5 shrink-0 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t p-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-center gap-2 rounded-lg py-2 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          {!collapsed && <span>Thu gọn</span>}
        </button>
      </div>
    </aside>
  );
}
