"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { XCircle, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MAIN_USER_KEY } from "@/infrastructure/api/mainAxiosClient";
import { paymentAPI } from "@/infrastructure/api/subscriptionAPI";

function PaymentCancelContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const [returnUrl, setReturnUrl] = useState("/login");
  const [cancelStatus, setCancelStatus] = useState<"loading" | "done" | "error">("loading");

  const paramCode = params?.orderCode;
  const orderCodeStr = Array.isArray(paramCode) ? paramCode[0] : paramCode || searchParams?.get("orderCode");
  const orderCode = orderCodeStr ? Number(orderCodeStr) : null;

  useEffect(() => {
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

    // Gọi API cancel để đồng bộ trạng thái với Backend
    const cancelOnServer = async () => {
      if (!orderCode) {
        setCancelStatus("done");
        return;
      }
      try {
        await paymentAPI.cancelPayment(orderCode);
        setCancelStatus("done");
      } catch (err) {
        // Nếu đơn đã cancelled hoặc không tìm thấy → cũng coi là done
        console.warn("Cancel payment API error (may already be cancelled):", err);
        setCancelStatus("done");
      }
    };

    cancelOnServer();
  }, [orderCode]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="max-w-md w-full bg-card rounded-xl shadow-lg border border-border p-8 text-center space-y-6">
        {cancelStatus === "loading" ? (
          <>
            <div className="mx-auto w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-4">
              <Loader2 className="w-10 h-10 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Đang xử lý hủy đơn...</h1>
            <p className="text-muted-foreground">Vui lòng chờ trong giây lát.</p>
          </>
        ) : (
          <>
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
              Giao dịch của bạn đã được hủy thành công. Tài khoản chưa bị trừ tiền.
            </p>
            <div className="pt-4">
              <Button className="w-full" size="lg" onClick={() => router.push(returnUrl)}>
                Quay lại bảng điều khiển
              </Button>
            </div>
          </>
        )}
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
