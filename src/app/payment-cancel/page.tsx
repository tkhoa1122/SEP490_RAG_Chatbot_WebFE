"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MAIN_USER_KEY } from "@/infrastructure/api/mainAxiosClient";

function PaymentCancelContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const [returnUrl, setReturnUrl] = useState("/login");

  const paramCode = params?.orderCode;
  const orderCodeStr = Array.isArray(paramCode) ? paramCode[0] : paramCode || searchParams?.get("orderCode");

  useEffect(() => {
    // Cố gắng tìm tenantId từ localStorage để quay về đúng dashboard
    try {
      const userStr = localStorage.getItem(MAIN_USER_KEY);
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user && user.tenantId) {
          setReturnUrl(`/${user.tenantId}/business/billing`);
          return;
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="max-w-md w-full bg-card rounded-xl shadow-lg border border-border p-8 text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
          <XCircle className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Thanh toán đã bị hủy</h1>
        {orderCodeStr && (
          <p className="font-mono text-sm bg-muted/50 py-1.5 px-3 rounded-md inline-block text-muted-foreground border">
            Mã đơn hàng: <strong className="text-foreground">#{orderCodeStr}</strong>
          </p>
        )}
        <p className="text-muted-foreground">
          Giao dịch của bạn chưa được hoàn tất hoặc đã bị hủy. Tài khoản chưa bị trừ tiền.
        </p>
        <div className="pt-4">
          <Button className="w-full" size="lg" onClick={() => router.push(returnUrl)}>
            Quay lại bảng điều khiển
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentCancelPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
      <PaymentCancelContent />
    </Suspense>
  );
}
