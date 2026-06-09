"use client";

import React, { useState } from "react";
import { Search, ShoppingBag, Menu, ArrowRight, User } from "lucide-react";
import Link from "next/link";
import { FloatingChatbot } from "@/components/chat/FloatingChatbot";

// Mock Data for Storefront - 8 Products
const STORE_PRODUCTS = [
  {
    id: 1,
    name: "Áo Thun Oversize Nam Nữ Trắng Basic",
    price: "250.000đ",
    category: "Áo thun",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80",
    badge: "Mới",
  },
  {
    id: 2,
    name: "Quần Jeans Ống Suông Wash Xanh",
    price: "450.000đ",
    category: "Quần",
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 3,
    name: "Áo Polo Nam Vải Cá Sấu Thoáng Khí",
    price: "320.000đ",
    category: "Áo polo",
    image: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=600&q=80",
    badge: "Bán chạy",
  },
  {
    id: 4,
    name: "Váy Đầm Dáng Chữ A Cổ Vuông",
    price: "380.000đ",
    category: "Váy",
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 5,
    name: "Áo Sơ Mi Nam Tay Dài Kẻ Sọc",
    price: "290.000đ",
    category: "Áo sơ mi",
    image: "https://images.unsplash.com/photo-1596755094514-f87e32f85e2c?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 6,
    name: "Quần Kaki Nam Dáng Slimfit",
    price: "350.000đ",
    category: "Quần",
    image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 7,
    name: "Chân Váy Xếp Ly Dáng Ngắn",
    price: "220.000đ",
    category: "Váy",
    image: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=600&q=80",
    badge: "Đang sale",
  },
  {
    id: 8,
    name: "Áo Khoác Bomber Gió Unisex",
    price: "490.000đ",
    category: "Áo khoác",
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=600&q=80",
  },
];

export default function RootPage({ params }: { params: { tenant_id: string } }) {
  // Mock login state. Toggle this to see the Cart and Profile
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const tenantId = params.tenant_id;

  return (
    <div className="min-h-screen bg-white">
      {/* --- Sticky Navbar --- */}
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-gray-500">
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#A8E6CF] text-[#2c5243]">
                <ShoppingBag className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold tracking-tight text-gray-900">
                Eco Fashion
              </span>
            </div>
            <nav className="hidden lg:ml-8 lg:flex lg:gap-6">
              <a href="#" className="text-sm font-medium text-gray-900">Trang chủ</a>
              <a href="#" className="text-sm font-medium text-gray-500 hover:text-gray-900">Sản phẩm mới</a>
              <a href="#" className="text-sm font-medium text-gray-500 hover:text-gray-900">Nam</a>
              <a href="#" className="text-sm font-medium text-gray-500 hover:text-gray-900">Nữ</a>
              <a href="#" className="text-sm font-medium text-red-500 hover:text-red-600">Sale 50%</a>
            </nav>
          </div>

          <div className="flex items-center gap-5">
            <button className="text-gray-400 hover:text-gray-600 transition-colors">
              <Search className="h-5 w-5" />
            </button>

            {isLoggedIn ? (
              <div className="flex items-center gap-5">
                <button className="relative text-gray-400 hover:text-gray-600 transition-colors">
                  <ShoppingBag className="h-5 w-5" />
                  <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#A8E6CF] text-[10px] font-bold text-[#2c5243]">
                    2
                  </span>
                </button>
                <div 
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200"
                  onClick={() => setIsLoggedIn(false)}
                  title="Đăng xuất (Demo)"
                >
                  <User className="h-4 w-4" />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 border-l border-slate-200 pl-5">
                <Link 
                  href={`/${tenantId}/login`} 
                  className="hidden text-sm font-medium text-slate-600 hover:text-slate-900 sm:block"
                >
                  Đăng ký
                </Link>
                <Link 
                  href={`/${tenantId}/login`} 
                  className="rounded-full bg-[#A8E6CF] px-5 py-2 text-sm font-semibold text-[#1c362b] shadow-sm transition-all hover:bg-[#97d0ba] hover:shadow"
                >
                  Đăng nhập
                </Link>
                {/* 
                  Nút Dev Tool nhỏ để bạn test luồng: 
                  Bấm vào để giả lập state Đã đăng nhập
                */}
                <button 
                  onClick={() => setIsLoggedIn(true)}
                  className="ml-2 hidden text-[10px] text-slate-300 hover:text-slate-500 sm:block"
                  title="Dev Toggle Login"
                >
                  [Test]
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main>
        {/* --- Hero Banner --- */}
        <section className="relative overflow-hidden bg-[#A8E6CF]/30 py-20 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8 relative z-10">
            <span className="inline-flex items-center rounded-full bg-white/60 px-3 py-1 text-sm font-medium text-[#2c5243] ring-1 ring-inset ring-[#A8E6CF]/50 backdrop-blur-sm">
              ✨ Ra mắt trợ lý ảo AI
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Thời trang Bền vững - <span className="text-[#5a9c82]">Trải nghiệm AI Shopping</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
              Khám phá bộ sưu tập mùa hè mới nhất. Đừng quên hỏi AI Assistant của chúng tôi ở góc phải màn hình để được tư vấn mix & match và chọn size chuẩn nhất.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <button className="rounded-full bg-[#2c5243] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#1c362b]">
                Khám phá ngay
              </button>
              <button className="group flex items-center gap-2 text-sm font-semibold leading-6 text-gray-900">
                Xem BST Nam <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
          {/* Decorative abstract shape */}
          <div className="absolute left-1/2 top-0 -z-10 -translate-x-1/2 blur-3xl xl:-top-6" aria-hidden="true">
            <div className="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-[#A8E6CF] to-[#C1E1C1] opacity-30" style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}></div>
          </div>
        </section>

        {/* --- Product Grid (8 Items) --- */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-gray-900">Sản phẩm nổi bật</h2>
              <p className="mt-2 text-sm text-gray-500">Những thiết kế được yêu thích nhất tháng này.</p>
            </div>
            <a href="#" className="hidden text-sm font-medium text-[#5a9c82] hover:text-[#2c5243] sm:block">
              Xem tất cả &rarr;
            </a>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-y-12 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8">
            {STORE_PRODUCTS.map((product) => (
              <div key={product.id} className="group relative">
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-gray-100 group-hover:opacity-75">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={product.image} alt={product.name} className="h-full w-full object-cover object-center" />
                  {product.badge && (
                    <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-semibold text-gray-900 shadow-sm backdrop-blur-md">
                      {product.badge}
                    </span>
                  )}
                  {/* Hover Add to cart button */}
                  <div className="absolute inset-x-0 bottom-0 flex p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <button className="w-full rounded-xl bg-white/90 py-2.5 text-sm font-semibold text-gray-900 shadow-sm backdrop-blur-md hover:bg-white">
                      Thêm vào giỏ
                    </button>
                  </div>
                </div>
                <div className="mt-4 flex justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">
                      <a href="#">
                        <span aria-hidden="true" className="absolute inset-0" />
                        {product.name}
                      </a>
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">{product.category}</p>
                  </div>
                  <p className="text-sm font-bold text-gray-900">{product.price}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* --- Floating Chatbot Component --- */}
      <FloatingChatbot />

    </div>
  );
}
