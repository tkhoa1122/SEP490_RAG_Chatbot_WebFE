// business/billing/page.tsx
// ⚠️  Trang nhạy cảm — CHỈ BUSINESS_OWNER được xem
// CATALOG_MARKETING bị chặn bởi Guard tại trang này

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { checkPermissionUseCase } from "@/domain/rules/CheckPermissionUseCase";
import type { User } from "@/domain/entities/User";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Thanh toán & Gói dịch vụ" };

export default async function BillingPage() {
  // Guard Layer 3: kiểm tra quyền billing tại chính trang nhạy cảm
  const cookieStore = await cookies();
  const userRole = cookieStore.get("user_role")?.value;
  const userId = cookieStore.get("user_id")?.value;

  // Tạo user object từ cookie để truyền vào UseCase
  const mockUser = userRole && userId
    ? { id: userId, role: userRole, email: "", name: "", createdAt: "" } as User
    : null;

  const permission = checkPermissionUseCase.execute(mockUser, "billing:read");

  if (!permission.allowed) {
    redirect("/business?error=FORBIDDEN_BILLING");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Thanh toán & Gói dịch vụ</h1>
        <p className="mt-1 text-muted-foreground">
          Quản lý gói cước và thông tin thanh toán của doanh nghiệp.
        </p>
      </div>
      {/* TODO: BillingPlansCard, InvoiceTable, PaymentMethodCard */}
    </div>
  );
}
