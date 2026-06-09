import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "403 — Không có quyền truy cập" };

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
      <div className="text-center">
        <p className="text-6xl font-bold text-destructive">403</p>
        <h1 className="mt-2 text-2xl font-semibold">Không có quyền truy cập</h1>
        <p className="mt-2 text-muted-foreground">
          Tài khoản của bạn không có quyền xem trang này.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Về trang đăng nhập
        </Link>
      </div>
    </div>
  );
}
