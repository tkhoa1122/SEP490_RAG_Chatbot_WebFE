"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Search, ShoppingBag, Menu, User, X } from "lucide-react";
import { authAPI } from "@/infrastructure/api/authAPI";
import { localCartAPI } from "@/infrastructure/api/storefrontAPI";

export function Header() {
  const params = useParams();
  const tenantId = params.tenant_id as string;
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");

  useEffect(() => {
    setIsLoggedIn(authAPI.isLoggedIn());
    setCartCount(localCartAPI.getTotalCount());

    // Custom event to update cart count from anywhere
    const handleCartUpdate = () => setCartCount(localCartAPI.getTotalCount());
    window.addEventListener("cartUpdated", handleCartUpdate);
    return () => window.removeEventListener("cartUpdated", handleCartUpdate);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/${tenantId}?q=${encodeURIComponent(searchQuery.trim())}#products`);
    } else {
      router.push(`/${tenantId}#products`);
    }
  };

  const handleLogout = () => {
    authAPI.logout();
    setIsLoggedIn(false);
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Logo & Menu Toggle */}
        <div className="flex items-center gap-4">
          <button className="lg:hidden text-gray-500 hover:text-gray-900 transition-colors">
            <Menu className="h-6 w-6" />
          </button>
          <Link href={`/${tenantId}`} className="flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2c5243] text-[#A8E6CF] transition-transform group-hover:scale-105">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#2c5243] capitalize hidden sm:block">
              {tenantId.replace(/-/g, " ")}
            </span>
          </Link>
          
          {/* Main Desktop Navigation */}
          <nav className="hidden lg:ml-10 lg:flex lg:gap-8">
            <Link href={`/${tenantId}#products`} className="text-sm font-semibold text-gray-900 hover:text-[#2c5243] transition-colors">
              MỚI NHẤT
            </Link>
            <Link href={`/${tenantId}#products`} className="text-sm font-semibold text-gray-500 hover:text-[#2c5243] transition-colors">
              SẢN PHẨM
            </Link>
            <Link href={`/${tenantId}#products`} className="text-sm font-semibold text-red-500 hover:text-red-600 transition-colors">
              SALE
            </Link>
          </nav>
        </div>

        {/* Right: Search, User, Cart */}
        <div className="flex items-center gap-4">
          {/* Search bar */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center relative">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-56 rounded-full border border-gray-200 bg-gray-50 py-2 pl-4 pr-10 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#2c5243] focus:outline-none focus:ring-1 focus:ring-[#2c5243] transition-all"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#2c5243]">
              <Search className="h-4 w-4" />
            </button>
          </form>

          {/* User & Auth */}
          {isLoggedIn ? (
            <div className="flex items-center gap-4 ml-2">
              <button
                onClick={handleLogout}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-50 text-slate-600 transition-colors hover:bg-slate-100 hover:text-red-500"
                title="Đăng xuất"
              >
                <User className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 ml-2">
              <Link
                href={`/${tenantId}/login`}
                className="text-sm font-medium text-slate-600 hover:text-[#2c5243] transition-colors hidden sm:block"
              >
                Đăng nhập
              </Link>
            </div>
          )}

          {/* Cart Icon */}
          <Link
            href={`/${tenantId}/cart`}
            className="relative flex h-9 w-9 items-center justify-center rounded-full bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors"
            title="Giỏ hàng"
          >
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
