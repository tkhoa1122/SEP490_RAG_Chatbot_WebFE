import type { Metadata } from "next";
import { PlansManager } from "@/components/dashboard/PlansManager";

export const metadata: Metadata = { title: "Gói cước & Quota" };
export default function PlansPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Gói cước & Quota AI
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Quản lý các gói cước và thiết lập giới hạn tài nguyên AI.
        </p>
      </div>
      <PlansManager />
    </div>
  );
}
