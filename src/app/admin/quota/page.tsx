import type { Metadata } from "next";
import { QuotaManager } from "@/components/dashboard/QuotaManager";

export const metadata: Metadata = { title: "Quota & Tài nguyên AI" };

export default function QuotaPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Quota &amp; Tài nguyên AI
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Theo dõi lịch sử thanh toán gói cước và mức tiêu thụ tài nguyên (Token, Tin nhắn, Sản phẩm) của từng doanh nghiệp.
        </p>
      </div>
      <QuotaManager />
    </div>
  );
}
