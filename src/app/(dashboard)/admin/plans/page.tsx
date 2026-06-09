import type { Metadata } from "next";
export const metadata: Metadata = { title: "Gói cước & Quota" };
export default function PlansPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Gói cước & Quota AI</h1>
      {/* TODO: PlansTable, QuotaManager, ResourceUsage */}
    </div>
  );
}
