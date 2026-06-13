"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ShoppingBag,
  Loader2,
  CheckCircle2,
  Package,
} from "lucide-react";
import { FloatingChatbot } from "@/components/chat/FloatingChatbot";
import {
  productAPI,
  variantAPI,
  localCartAPI,
} from "@/infrastructure/api/storefrontAPI";
import type { ProductResponse, VariantResponse } from "@/types/api";
import { StatusEnum } from "@/types/api";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

export default function ProductDetailPage() {
  const params = useParams();
  const tenantId = params.tenant_id as string;
  const productId = params.productId as string;
  const productIdNum = parseInt(productId, 10);

  const [product, setProduct] = useState<ProductResponse | null>(null);
  const [variants, setVariants] = useState<VariantResponse[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<VariantResponse | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [cartMessage, setCartMessage] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("auth_token"));
  }, []);

  useEffect(() => {
    if (!productIdNum) return;

    const fetchAll = async () => {
      setLoading(true);
      try {
        const [productRes, variantsRes] = await Promise.all([
          productAPI.getById(productIdNum),
          variantAPI.getAll({ pageIndex: 1, pageSize: 100 }),
        ]);

        setProduct(productRes.data ?? null);

        const productVariants = (variantsRes.data?.items ?? []).filter(
          (v) => v.productId === productIdNum && v.status === StatusEnum.Active
        );
        setVariants(productVariants);

        if (productVariants.length > 0) {
          setSelectedVariant(productVariants[0]);
          setSelectedImage(productVariants[0].imageUrl?.[0] ?? "");
        }
      } catch (err) {
        console.error("Lỗi:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [productIdNum]);

  // ── Thêm vào giỏ hàng (localStorage) ─────────────────────────────────────
  const handleAddToCart = () => {
    if (!isLoggedIn) {
      window.location.href = `/${tenantId}/login`;
      return;
    }
    if (!selectedVariant) return;

    localCartAPI.add({
      variantId: selectedVariant.id,
      productName: product?.name ?? "",
      variantName: selectedVariant.variantName,
      price: selectedVariant.price,
      imageUrl: selectedVariant.imageUrl?.[0] ?? "",
      quantity,
    });

    setCartMessage("Đã thêm vào giỏ hàng!");
    setTimeout(() => setCartMessage(null), 3000);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-[#A8E6CF]" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white">
        <Package className="h-16 w-16 text-gray-300" />
        <p className="text-gray-500">Không tìm thấy sản phẩm.</p>
        <Link
          href={`/${tenantId}`}
          className="rounded-full bg-[#2c5243] px-5 py-2 text-sm font-medium text-white"
        >
          Quay lại cửa hàng
        </Link>
      </div>
    );
  }

  const allImages = selectedVariant?.imageUrl ?? [];

  return (
    <div className="min-h-screen bg-white">
      {/* ── Breadcrumb ─────────────────────────────────────────────────────── */}
      <div className="border-b border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link href={`/${tenantId}`} className="hover:text-gray-900 flex items-center gap-1.5">
              <ArrowLeft className="h-3.5 w-3.5" />
              Cửa hàng
            </Link>
            <span>/</span>
            <span className="text-gray-900">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          {/* ── Image Gallery ───────────────────────────────────────────────── */}
          <div className="space-y-3">
            <div className="aspect-square overflow-hidden rounded-2xl bg-gray-100">
              {selectedImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selectedImage}
                  alt={product.name}
                  className="h-full w-full object-cover object-center"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <ShoppingBag className="h-16 w-16 text-gray-300" />
                </div>
              )}
            </div>

            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(img)}
                    className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                      selectedImage === img
                        ? "border-[#2c5243]"
                        : "border-transparent hover:border-gray-300"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Product Info ─────────────────────────────────────────────────── */}
          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium text-[#5a9c82]">
                {product.categoryName} · {product.brand}
              </p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-900">
                {product.name}
              </h1>
              <p className="mt-4 text-3xl font-bold text-gray-900">
                {selectedVariant ? formatPrice(selectedVariant.price) : "Liên hệ"}
              </p>
            </div>

            {/* Variant selector */}
            {variants.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-700">
                  Biến thể:{" "}
                  <span className="font-normal text-gray-500">
                    {selectedVariant?.variantName}
                  </span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => {
                        setSelectedVariant(v);
                        setSelectedImage(v.imageUrl?.[0] ?? "");
                        setQuantity(1);
                      }}
                      disabled={v.stockQuantity === 0}
                      className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
                        selectedVariant?.id === v.id
                          ? "border-[#2c5243] bg-[#2c5243] text-white"
                          : "border-gray-200 bg-white text-gray-700 hover:border-[#2c5243]"
                      }`}
                    >
                      {v.variantName}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock */}
            {selectedVariant && (
              <p className="text-sm">
                {selectedVariant.stockQuantity > 0 ? (
                  <span className="text-emerald-600">
                    ✓ Còn {selectedVariant.stockQuantity} sản phẩm
                  </span>
                ) : (
                  <span className="text-red-500">✗ Hết hàng</span>
                )}
              </p>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-700">Số lượng:</span>
              <div className="flex items-center gap-2 rounded-lg border border-gray-200">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="flex h-9 w-9 items-center justify-center text-gray-600 hover:bg-gray-50"
                >
                  −
                </button>
                <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                <button
                  onClick={() =>
                    setQuantity((q) =>
                      Math.min(selectedVariant?.stockQuantity ?? 1, q + 1)
                    )
                  }
                  className="flex h-9 w-9 items-center justify-center text-gray-600 hover:bg-gray-50"
                >
                  +
                </button>
              </div>
            </div>

            {/* Success message */}
            {cartMessage && (
              <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
                {cartMessage}
              </div>
            )}

            {/* Add to cart */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={!selectedVariant || selectedVariant.stockQuantity === 0}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#2c5243] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#1c362b] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <ShoppingBag className="h-4 w-4" />
                {!isLoggedIn
                  ? "Đăng nhập để mua"
                  : selectedVariant?.stockQuantity === 0
                  ? "Hết hàng"
                  : "Thêm vào giỏ hàng"}
              </button>

              <Link
                href={`/${tenantId}/cart`}
                className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50"
              >
                Xem giỏ
              </Link>
            </div>

            {/* Description */}
            <div className="border-t border-gray-100 pt-6">
              <h3 className="text-sm font-semibold text-gray-900">Mô tả sản phẩm</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                {product.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      <FloatingChatbot />
    </div>
  );
}
