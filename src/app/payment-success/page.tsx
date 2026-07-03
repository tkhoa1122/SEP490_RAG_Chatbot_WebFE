"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MAIN_USER_KEY } from "@/infrastructure/api/mainAxiosClient";
import { paymentAPI } from "@/infrastructure/api/subscriptionAPI";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { Suspense } from "react";

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [returnUrl, setReturnUrl] = useState("/login");
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    // Kích hoạt pháo giấy chúc mừng
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults, particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults, particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);

    // Cố gắng tìm tenantId từ localStorage để quay về đúng dashboard
    try {
      const userStr = localStorage.getItem(MAIN_USER_KEY);
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user && user.tenantId) {
          setReturnUrl(`/${user.tenantId}/business/billing`);
        }
      }
    } catch (e) {
      console.error(e);
    }

    // Xác nhận thanh toán qua API Mock do Webhook thật không thể gọi vào localhost
    const orderCode = searchParams.get("orderCode");
    if (orderCode) {
      paymentAPI.simulatePaymentSuccess(Number(orderCode))
        .then(() => toast.success("Hệ thống đã ghi nhận thanh toán thành công!"))
        .catch(() => toast.error("Có lỗi xảy ra khi xác nhận thanh toán (Mock Webhook)"))
        .finally(() => setVerifying(false));
    } else {
      setVerifying(false);
    }

    return () => clearInterval(interval);
  }, [searchParams]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="max-w-md w-full bg-card rounded-xl shadow-lg border border-border p-8 text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4 relative">
          <CheckCircle2 className="w-10 h-10" />
          {verifying && <Loader2 className="w-16 h-16 absolute animate-spin text-emerald-300 opacity-50" />}
        </div>
        <h1 className="text-2xl font-bold text-foreground">Thanh toán thành công!</h1>
        <p className="text-muted-foreground">
          {verifying ? "Đang đồng bộ trạng thái giao dịch..." : "Cảm ơn bạn đã đăng ký gói cước. Giao dịch đã được ghi nhận và tài nguyên của bạn đã được cập nhật."}
        </p>
        <div className="pt-4">
          <Button className="w-full" size="lg" disabled={verifying} onClick={() => router.push(returnUrl)}>
            {verifying ? "Đang xác nhận..." : "Tiếp tục sử dụng dịch vụ"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
