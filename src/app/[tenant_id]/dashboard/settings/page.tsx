import type { Metadata } from "next";
export const metadata: Metadata = { title: "Cài đặt" };
export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Cài đặt doanh nghiệp</h1>
      {/* TODO: TenantSettingsForm, ChatWidgetConfig */}
    </div>
  );
}
