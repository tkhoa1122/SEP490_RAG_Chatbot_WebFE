"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ShoppingBag,
  Trash2,
  Minus,
  Plus,
  ShoppingCart,
} from "lucide-react";
import { FloatingChatbot } from "@/components/chat/FloatingChatbot";
import { localCartAPI, type LocalCartItem } from "@/infrastructure/api/storefrontAPI";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

export default function CartPage({ params }: { params: { tenant_id: string } }) {
  const tenantId = params.tenant_id;
  const [cartItems, setCartItems] = useState<LocalCartItem[]>([]);

  // ── Load giỏ hàng từ localStorage ────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      window.location.href = `/${tenantId}/login`;
      return;
    }
    setCartItems(localCartAPI.getAll());
  }, [tenantId]);

  // ── Cập nhật số lượng ─────────────────────────────────────────────────────
  const handleUpdateQty = (variantId: number, newQty: number) => {
    if (newQty < 1) return;
    localCartAPI.updateQuantity(variantId, newQty);
    setCartItems(localCartAPI.getAll());
  };

  // ── Xóa sản phẩm ─────────────────────────────────────────────────────────
  const handleDelete = (variantId: number) => {
    localCartAPI.remove(variantId);
    setCartItems(localCartAPI.getAll());
  };

  // ── Tổng tiền ─────────────────────────────────────────────────────────────
  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex h-16 max-w-4xl items-center gap-4 px-4 sm:px-6">
          <Link
            href={`/${tenantId}`}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Tiếp tục mua sắm
          </Link>
          <h1 className="text-base font-bold text-gray-900">
            Giỏ hàng{totalItems > 0 ? ` (${totalItems})` : ""}
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {/* Empty cart */}
        {cartItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <ShoppingCart className="h-16 w-16 text-gray-200" />
            <h2 className="mt-4 text-lg font-semibold text-gray-700">Giỏ hàng trống</h2>
            <p className="mt-1 text-sm text-gray-500">Hãy thêm sản phẩm vào giỏ để tiếp tục.</p>
            <Link
              href={`/${tenantId}`}
              className="mt-6 rounded-full bg-[#2c5243] px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#1c362b]"
            >
              Khám phá sản phẩm
            </Link>
          </div>
        )}

        {/* Cart items + summary */}
        {cartItems.length > 0 && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Items list */}
            <div className="lg:col-span-2 space-y-3">
              {cartItems.map((item) => (
                <div
                  key={item.variantId}
                  className="flex gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
                >
                  {/* Product image */}
                  <div className="flex h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#A8E6CF]/20">
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.imageUrl}
                        alt={item.productName}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <ShoppingBag className="h-8 w-8 text-[#5a9c82]" />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-900 leading-snug">
                          {item.productName}
                        </p>
                        <p className="mt-0.5 text-xs text-gray-400">{item.variantName}</p>
                      </div>
                      <button
                        onClick={() => handleDelete(item.variantId)}
                        className="text-gray-300 transition-colors hover:text-red-500"
                        aria-label="Xóa"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      {/* Quantity controls */}
                      <div className="flex items-center gap-2 rounded-lg border border-gray-200">
                        <button
                          onClick={() => handleUpdateQty(item.variantId, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="flex h-7 w-7 items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQty(item.variantId, item.quantity + 1)}
                          className="flex h-7 w-7 items-center justify-center text-gray-500 hover:bg-gray-50"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <p className="text-sm font-bold text-gray-900">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <h2 className="text-base font-bold text-gray-900">Tổng đơn hàng</h2>

                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Tạm tính ({totalItems} sản phẩm)</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Phí vận chuyển</span>
                    <span className="text-emerald-600">Miễn phí</span>
                  </div>
                  <div className="border-t border-gray-100 pt-2 flex justify-between text-base font-bold text-gray-900">
                    <span>Tổng cộng</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>

                <button className="mt-4 w-full rounded-xl bg-[#2c5243] py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#1c362b]">
                  Tiến hành thanh toán
                </button>

                <Link
                  href={`/${tenantId}`}
                  className="mt-3 block text-center text-xs text-gray-400 hover:text-gray-600"
                >
                  Tiếp tục mua sắm
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      <FloatingChatbot />
    </div>
  );
}
