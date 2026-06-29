import type { Metadata } from "next";
import { SystemContentsManager } from "@/components/dashboard/SystemContentsManager";

export const metadata: Metadata = { title: "Chính sách nền tảng" };

export default function PoliciesPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Chính sách &amp; Nội dung hệ thống
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Quản lý Điều khoản sử dụng, Chính sách bảo mật và các trang tĩnh công khai của nền tảng.
        </p>
      </div>
      <SystemContentsManager />
    </div>
  );
}
