// (chat)/[tenant_id]/layout.tsx
// Guard Layer 2 cho Public Chat
// Middleware không chặn route này, nhưng layout này validate tenant_id
// bằng cách gọi CheckTenantUseCase

import { notFound } from "next/navigation";
import { CheckTenantUseCase } from "@/domain/rules/CheckTenantUseCase";
import { tenantRepositoryImpl } from "@/infrastructure/repositories/TenantRepositoryImpl";

interface ChatLayoutProps {
  children: React.ReactNode;
  params: Promise<{ tenant_id: string }>;
}

const checkTenantUseCase = new CheckTenantUseCase(tenantRepositoryImpl);

export default async function ChatLayout({ children, params }: ChatLayoutProps) {
  const { tenant_id } = await params;

  // Gọi CheckTenantUseCase — nếu tenant không hợp lệ → 404
  const result = await checkTenantUseCase.execute(tenant_id);
  if (!result.valid) {
    notFound(); // Render Next.js not-found.tsx
  }

  // Tenant hợp lệ → render chat widget (không có sidebar/header hệ thống)
  return (
    <div className="flex h-screen flex-col bg-background">
      {children}
    </div>
  );
}
