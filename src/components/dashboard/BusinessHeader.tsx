"use client";

import { Search, Bell, LogOut, User, ChevronDown, Menu, Store } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { mainAuthAPI } from "@/infrastructure/api/mainAuthAPI";
import { useEffect, useState } from "react";
import { getRoleFromCookie } from "@/infrastructure/api/mainAuthAPI";
import { businessAPI } from "@/infrastructure/api/businessAPI";

export function BusinessHeader() {
  const [role, setRole] = useState("Business User");
  const [businessName, setBusinessName] = useState("Cửa hàng");

  useEffect(() => {
    const roleStr = getRoleFromCookie();
    if (roleStr === "BUSINESS_OWNER") setRole("Chủ cửa hàng");
    else if (roleStr === "CATALOG_MARKETING") setRole("Catalog Team");

    const fetchBusinessProfile = async () => {
      try {
        const res = await businessAPI.getProfile();
        if (res.data && res.data.businessName) {
          setBusinessName(res.data.businessName);
        }
      } catch (err) {
        console.error("Failed to fetch business profile", err);
      }
    };
    
    fetchBusinessProfile();
  }, []);

  const handleLogout = () => {
    mainAuthAPI.logout();
    // Dùng window.location.href thay vì router.push để force full-page reload
    // giúp Next.js middleware đọc lại cookies mới (đã xóa) chính xác
    window.location.href = "/login";
  };

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
            placeholder="Tìm kiếm sản phẩm, đơn hàng..."
            className={cn(
              "h-9 w-70 rounded-lg border border-border bg-muted/40 pl-9 pr-4 text-sm text-foreground",
              "outline-none transition-all placeholder:text-muted-foreground/60",
              "focus:w-90 focus:border-ring focus:bg-background focus:ring-2 focus:ring-ring/20"
            )}
          />
        </div>
      </div>

      {/* Right: Notifications + Profile */}
      <div className="flex items-center gap-2">
        {/* Divider */}
        <div className="mx-1 h-6 w-px bg-border hidden sm:block" />

        {/* Profile dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger render={
            <button className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted outline-none">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                <Store className="h-4 w-4" />
              </div>
              <div className="hidden text-left sm:block">
                <p className="text-sm font-medium leading-tight text-foreground line-clamp-1 max-w-[150px]">{businessName}</p>
                <p className="text-[11px] text-muted-foreground">{role}</p>
              </div>
              <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground sm:block" />
            </button>
          } />
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:bg-red-50 focus:text-red-600 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Đăng xuất</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
