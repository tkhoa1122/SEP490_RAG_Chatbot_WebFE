import type { Metadata } from "next";
import { TenantSettingsForm } from "@/components/business/settings/TenantSettingsForm";

export const metadata: Metadata = { title: "Cài đặt Doanh nghiệp | Smart Shopping Chatbot" };

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Cài đặt doanh nghiệp
        </h1>
        <p className="text-muted-foreground mt-2">
          Quản lý hồ sơ hiển thị và thông tin cơ bản của doanh nghiệp.
        </p>
      </div>

      <div className="animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
        <TenantSettingsForm />
      </div>
    </div>
  );
}
