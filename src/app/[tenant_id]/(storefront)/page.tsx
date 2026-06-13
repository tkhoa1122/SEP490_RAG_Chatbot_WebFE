"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  ShoppingBag,
  Menu,
  ArrowRight,
  User,
  Loader2,
  X,
  SlidersHorizontal,
} from "lucide-react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { FloatingChatbot } from "@/components/chat/FloatingChatbot";
import { productAPI, variantAPI, categoryAPI, localCartAPI } from "@/infrastructure/api/storefrontAPI";
import { authAPI } from "@/infrastructure/api/authAPI";
import type { ProductResponse, VariantResponse, CategoryResponse } from "@/types/api";
import { StatusEnum } from "@/types/api";

// ── Kiểu dữ liệu hiển thị trên card sản phẩm ────────────────────────────────
interface ProductCard {
  productId: number;
  name: string;
  brand: string;
  categoryName: string;
  description: string;
  // Từ variant đầu tiên active
  price: number;
  imageUrl: string;
  variantId: number;
  stockQuantity: number;
}

// ── Skeleton Card ─────────────────────────────────────────────────────────────
function ProductSkeleton() {
  return (
    <div className="animate-pulse group relative">
      <div className="aspect-3/4 w-full rounded-2xl bg-gray-200" />
      <div className="mt-4 space-y-2">
        <div className="h-3 w-3/4 rounded bg-gray-200" />
        <div className="h-3 w-1/2 rounded bg-gray-200" />
        <div className="h-4 w-1/3 rounded bg-gray-200" />
      </div>
    </div>
  );
}

// ── Trang chủ Storefront ──────────────────────────────────────────────────────
export default function StorefrontPage() {
  const params = useParams();
  const tenantId = params.tenant_id as string;

  // ── State ──────────────────────────────────────────────────────────────────
  const [products, setProducts] = useState<ProductCard[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  // ── Đọc số lượng giỏ hàng từ localStorage ─────────────────────────────────
  useEffect(() => {
    setIsLoggedIn(authAPI.isLoggedIn());
    setCartCount(localCartAPI.getTotalCount());
  }, []);

  // ── Fetch dữ liệu từ API ───────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Gọi song song: danh sách sản phẩm, danh mục, và biến thể
      const [productsRes, categoriesRes, variantsRes] = await Promise.all([
        productAPI.getAll({ pageIndex: 1, pageSize: 50 }),
        categoryAPI.getAll({ pageIndex: 1, pageSize: 100 }),
        variantAPI.getAll({ pageIndex: 1, pageSize: 100 }),
      ]);

      const rawProducts: ProductResponse[] = productsRes.data?.items ?? [];
      const rawCategories: CategoryResponse[] = categoriesRes.data?.items ?? [];
      const rawVariants: VariantResponse[] = variantsRes.data?.items ?? [];

      setCategories(rawCategories);

      // ── Ghép sản phẩm với variant đầu tiên (có ảnh và giá) ────────────────
      const productCards: ProductCard[] = rawProducts
        .filter((p) => p.status === StatusEnum.Active)
        .map((product) => {
          // Tìm các variant thuộc sản phẩm này
          const productVariants = rawVariants.filter(
            (v) => v.productId === product.id && v.status === StatusEnum.Active
          );

          // Lấy variant đầu tiên để hiển thị giá và ảnh
          const firstVariant = productVariants[0];

          return {
            productId: product.id,
            name: product.name,
            brand: product.brand,
            categoryName: product.categoryName,
            description: product.description,
            price: firstVariant?.price ?? 0,
            imageUrl: firstVariant?.imageUrl?.[0] ?? "",
            variantId: firstVariant?.id ?? 0,
            stockQuantity: firstVariant?.stockQuantity ?? 0,
          };
        });

      setProducts(productCards);
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu:", err);
      setError("Không thể tải dữ liệu. Vui lòng kiểm tra kết nối Backend.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Filter & Search (phía client) ─────────────────────────────────────────
  const filteredProducts = products.filter((p) => {
    const matchCategory =
      selectedCategory === null ||
      categories.find((c) => c.id === selectedCategory)?.name === p.categoryName;
    const matchSearch =
      searchQuery === "" ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  // ── Format giá tiền ───────────────────────────────────────────────────────
  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  // ── UI ─────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white">
      {/* ── Sticky Navbar ────────────────────────────────────────────────── */}
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
              <span className="text-lg font-bold tracking-tight text-gray-900 capitalize">
                {tenantId.replace(/-/g, " ")}
              </span>
            </div>
            <nav className="hidden lg:ml-8 lg:flex lg:gap-6">
              <a href="#" className="text-sm font-medium text-gray-900">
                Trang chủ
              </a>
              <a href="#products" className="text-sm font-medium text-gray-500 hover:text-gray-900">
                Sản phẩm
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {/* Search bar */}
            <div className="hidden md:flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5">
              <Search className="h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm sản phẩm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-40 bg-transparent text-sm text-gray-700 placeholder:text-gray-400 outline-none"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")}>
                  <X className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            {isLoggedIn ? (
              <div className="flex items-center gap-4">
                {/* Cart */}
                <Link
                  href={`/${tenantId}/cart`}
                  className="relative text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <ShoppingBag className="h-5 w-5" />
                  {cartCount > 0 && (
                    <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#A8E6CF] text-10px font-bold text-[#2c5243]">
                      {cartCount}
                    </span>
                  )}
                </Link>
                <button
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200"
                  onClick={() => {
                    authAPI.logout();
                    setIsLoggedIn(false);
                  }}
                  title="Đăng xuất"
                >
                  <User className="h-4 w-4" />
                </button>
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
              </div>
            )}
          </div>
        </div>
      </header>

      <main>
        {/* ── Hero Banner ──────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-[#A8E6CF]/30 py-20 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8 relative z-10">
            <span className="inline-flex items-center rounded-full bg-white/60 px-3 py-1 text-sm font-medium text-[#2c5243] ring-1 ring-inset ring-[#A8E6CF]/50 backdrop-blur-sm">
              ✨ Trợ lý ảo AI — Tư vấn mua sắm thông minh
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Mua sắm thông minh —{" "}
              <span className="text-[#5a9c82]">Với AI Assistant</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
              Khám phá bộ sưu tập đa dạng. Hỏi AI Assistant ở góc phải màn
              hình để được tư vấn mix &amp; match và chọn size chuẩn nhất.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <a
                href="#products"
                className="rounded-full bg-[#2c5243] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#1c362b]"
              >
                Khám phá ngay
              </a>
              <button className="group flex items-center gap-2 text-sm font-semibold leading-6 text-gray-900">
                Xem tất cả{" "}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>

          {/* Decorative shape */}
          <div
            className="absolute left-1/2 top-0 -z-10 -translate-x-1/2 blur-3xl xl:-top-6"
            aria-hidden="true"
          >
            <div
              className="aspect-1155/678 w-288.75 bg-linear-to-tr from-[#A8E6CF] to-[#C1E1C1] opacity-30"
              style={{
                clipPath:
                  "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
              }}
            />
          </div>
        </section>

        {/* ── Category Filter ───────────────────────────────────────────────── */}
        {categories.length > 0 && (
          <section className="border-b border-gray-100 bg-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-3 overflow-x-auto py-4 scrollbar-hide">
                <SlidersHorizontal className="h-4 w-4 shrink-0 text-gray-400" />
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                    selectedCategory === null
                      ? "bg-[#2c5243] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Tất cả
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() =>
                      setSelectedCategory(
                        selectedCategory === cat.id ? null : cat.id
                      )
                    }
                    className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                      selectedCategory === cat.id
                        ? "bg-[#2c5243] text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Product Grid ──────────────────────────────────────────────────── */}
        <section
          id="products"
          className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8"
        >
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                Sản phẩm nổi bật
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                {loading
                  ? "Đang tải..."
                  : `${filteredProducts.length} sản phẩm`}
              </p>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="mt-8 rounded-2xl border border-red-100 bg-red-50 p-6 text-center">
              <p className="text-sm font-medium text-red-600">{error}</p>
              <button
                onClick={fetchData}
                className="mt-3 rounded-lg bg-red-100 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-200"
              >
                Thử lại
              </button>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="mt-8 grid grid-cols-1 gap-y-12 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredProducts.length === 0 && (
            <div className="mt-16 text-center">
              <ShoppingBag className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-4 text-sm text-gray-500">
                {searchQuery
                  ? `Không tìm thấy sản phẩm với từ khóa "${searchQuery}"`
                  : "Chưa có sản phẩm nào"}
              </p>
            </div>
          )}

          {/* Product Grid */}
          {!loading && !error && filteredProducts.length > 0 && (
            <div className="mt-8 grid grid-cols-1 gap-y-12 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8">
              {filteredProducts.map((product) => (
                <div key={product.productId} className="group relative">
                  <Link
                    href={`/${tenantId}/products/${product.productId}`}
                    className="block"
                  >
                    <div className="relative aspect-3/4 w-full overflow-hidden rounded-2xl bg-gray-100 group-hover:opacity-75 transition-opacity">
                      {product.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="h-full w-full object-cover object-center"
                          onError={(e) => {
                            // Fallback nếu ảnh lỗi
                            (e.target as HTMLImageElement).src =
                              "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80";
                          }}
                        />
                      ) : (
                        // Placeholder nếu không có ảnh
                        <div className="flex h-full items-center justify-center bg-gray-200">
                          <ShoppingBag className="h-12 w-12 text-gray-400" />
                        </div>
                      )}

                      {/* Out of stock badge */}
                      {product.stockQuantity === 0 && (
                        <span className="absolute left-3 top-3 rounded-full bg-red-500/90 px-2.5 py-0.5 text-xs font-semibold text-white">
                          Hết hàng
                        </span>
                      )}

                      {/* Hover: Add to cart */}
                      {product.stockQuantity > 0 && (
                        <div className="absolute inset-x-0 bottom-0 flex p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              if (!isLoggedIn) {
                                window.location.href = `/${tenantId}/login`;
                                return;
                              }
                              // Thêm vào giỏ localStorage
                              localCartAPI.add({
                                variantId: product.variantId,
                                productName: product.name,
                                variantName: product.name,
                                price: product.price,
                                imageUrl: product.imageUrl,
                              });
                              setCartCount(localCartAPI.getTotalCount());
                            }}
                            className="w-full rounded-xl bg-white/90 py-2.5 text-sm font-semibold text-gray-900 shadow-sm backdrop-blur-md hover:bg-white"
                          >
                            {isLoggedIn ? "Thêm vào giỏ" : "Đăng nhập để mua"}
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="truncate text-sm font-medium text-gray-700">
                          {product.name}
                        </h3>
                        <p className="mt-0.5 text-xs text-gray-400">
                          {product.brand} · {product.categoryName}
                        </p>
                      </div>
                      <p className="ml-2 shrink-0 text-sm font-bold text-gray-900">
                        {product.price > 0
                          ? formatPrice(product.price)
                          : "Liên hệ"}
                      </p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* ── Floating Chatbot ─────────────────────────────────────────────────── */}
      <FloatingChatbot />
    </div>
  );
}
