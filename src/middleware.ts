// src/middleware.ts
// Next.js Edge Middleware — Guard tầng đầu tiên, chạy trước mọi request
// Phân tích route → kiểm tra token → redirect nếu không hợp lệ

import { NextRequest, NextResponse } from "next/server";

// ─── Route patterns ──────────────────────────────────────────────────────────
const PUBLIC_ROUTES = ["/login", "/register", "/forgot-password"];
const ADMIN_ROUTES = ["/admin"];
const BUSINESS_ROUTES = ["/business"];

// Các route không cần xử lý (Next.js internals, static files)
const BYPASS_PREFIXES = ["/_next", "/api", "/favicon.ico", "/public"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Bỏ qua static files và API routes
  if (BYPASS_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const token = request.cookies.get("auth_token")?.value;
  const userRole = request.cookies.get("user_role")?.value;

  // ── (auth) routes: đã đăng nhập → redirect về dashboard ──────────────────
  if (PUBLIC_ROUTES.some((r) => pathname.startsWith(r))) {
    if (token) {
      const dashboardUrl = getDashboardUrl(userRole);
      return NextResponse.redirect(new URL(dashboardUrl, request.url));
    }
    return NextResponse.next();
  }

  // ── (dashboard)/admin: bắt buộc SYSTEM_ADMIN ─────────────────────────────
  if (ADMIN_ROUTES.some((r) => pathname.startsWith(r))) {
    if (!token) {
      return redirectToLogin(request, "NOT_AUTHENTICATED");
    }
    if (userRole !== "SYSTEM_ADMIN") {
      return NextResponse.redirect(new URL("/403", request.url));
    }
    return NextResponse.next();
  }

  // ── (dashboard)/business: bắt buộc BUSINESS_OWNER hoặc CATALOG_MARKETING ─
  if (BUSINESS_ROUTES.some((r) => pathname.startsWith(r))) {
    if (!token) {
      return redirectToLogin(request, "NOT_AUTHENTICATED");
    }
    const allowedRoles = ["BUSINESS_OWNER", "CATALOG_MARKETING"];
    if (!allowedRoles.includes(userRole ?? "")) {
      return NextResponse.redirect(new URL("/403", request.url));
    }
    return NextResponse.next();
  }

  // ── (chat)/[tenant_id]: public — middleware không chặn, layout sẽ validate ─
  // tenant_id validation được xử lý bởi CheckTenantUseCase trong layout.tsx
  return NextResponse.next();
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function redirectToLogin(request: NextRequest, reason: string): NextResponse {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
  loginUrl.searchParams.set("reason", reason);
  return NextResponse.redirect(loginUrl);
}

function getDashboardUrl(role?: string): string {
  switch (role) {
    case "SYSTEM_ADMIN": return "/admin";
    case "BUSINESS_OWNER":
    case "CATALOG_MARKETING": return "/business";
    default: return "/login";
  }
}

// Chỉ chạy middleware trên các routes này
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
