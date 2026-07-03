"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MAIN_USER_KEY } from "@/infrastructure/api/mainAxiosClient";

export default function PaymentCancelPage() {
  const router = useRouter();
  const [returnUrl, setReturnUrl] = useState("/login");

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
