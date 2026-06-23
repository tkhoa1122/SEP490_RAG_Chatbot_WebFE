/**
 * 🔐 Main Auth API — Dành cho Admin / Business Owner / Catalog Team
 *
 * Gọi Main DB tại NEXT_PUBLIC_MAIN_API_URL (localhost:5000)
 * KHÔNG dùng cho Buyer (dùng authAPI.ts cho Buyer).
 *
 * Endpoints:
 *   POST /api/v1/auth/login  — { email, password }
 *   GET  /api/v1/auth/me     — Lấy profile người dùng hiện tại
 *
 * Token được lưu tách biệt hoàn toàn:
 *   localStorage key: "main_auth_token"   (≠ Buyer: "auth_token")
 *   Cookie:           "auth_token" + "user_role" + "tenant_id"  ← middleware đọc
 */

import mainAxiosClient, { MAIN_TOKEN_KEY, MAIN_USER_KEY } from "./mainAxiosClient";
import { UserRole } from "@/domain/entities/User";

// ── Request / Response types ───────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

/** Response từ POST /api/v1/auth/login */
export interface LoginResponse {
  token: string;
  userId?: string;
  email?: string;
  fullName?: string;
  role?: string;
  tenantId?: string | null;
}

/** Response từ GET /api/v1/auth/me */
export interface MeResponse {
  id: string;
  email: string;
  fullName?: string;
  role: string;
  tenantId?: string | null;
  status?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: number;
  avatarUrl?: string;
}

// Wrapper chung mà BE hay trả về
interface ApiWrapper<T> {
  success?: boolean;
  message?: string;
  data?: T;
  statusCode?: number;
}

// ── Main Auth API ──────────────────────────────────────────────────────────────

export const mainAuthAPI = {
  /**
   * Đăng nhập dành cho Admin / BO / CT
   * POST /api/v1/auth/login
   */
  login: async (request: LoginRequest): Promise<ApiWrapper<LoginResponse>> => {
    const { data } = await mainAxiosClient.post<ApiWrapper<LoginResponse>>(
      "/auth/login",
      request
    );

    const payload = data.data;
    if (payload?.token) {
      saveMainToken(payload.token, {
        role: payload.role,
        tenantId: payload.tenantId,
      });
    }

    return data;
  },

  /**
   * Lấy thông tin profile người dùng hiện tại
   * GET /api/v1/auth/me
   */
  getMe: async (): Promise<ApiWrapper<MeResponse>> => {
    const { data } = await mainAxiosClient.get<ApiWrapper<MeResponse>>("/auth/me");
    return data;
  },

  /**
   * Đăng xuất — xóa token khỏi localStorage và cookies
   */
  logout: (): void => {
    clearMainToken();
  },

  /**
   * Lấy token từ localStorage
   */
  getToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(MAIN_TOKEN_KEY);
  },

  /**
   * Kiểm tra đã đăng nhập chưa
   */
  isLoggedIn: (): boolean => {
    return !!mainAuthAPI.getToken();
  },

  /**
   * Lấy thông tin user đang đăng nhập (từ localStorage cache)
   */
  getCachedUser: (): MeResponse | null => {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(MAIN_USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as MeResponse;
    } catch {
      return null;
    }
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Lưu token vào localStorage + cookies (để middleware Next.js đọc được)
 */
function saveMainToken(
  token: string,
  meta: { role?: string; tenantId?: string | null }
): void {
  if (typeof window === "undefined") return;

  // localStorage — client-side
  localStorage.setItem(MAIN_TOKEN_KEY, token);

  // Cookie — middleware & server component đọc được
  const expires = new Date();
  expires.setDate(expires.getDate() + 7); // 7 ngày
  const cookieOptions = `path=/; expires=${expires.toUTCString()}; SameSite=Lax`;

  // Ghi đè auth_token cookie (middleware chỉ có 1 cookie key để đọc)
  document.cookie = `auth_token=${token}; ${cookieOptions}`;

  // Ghi role để middleware phân quyền route
  if (meta.role) {
    document.cookie = `user_role=${meta.role}; ${cookieOptions}`;
  }

  // Ghi tenant_id để middleware điều hướng BO/CT đúng workspace
  if (meta.tenantId) {
    document.cookie = `tenant_id=${meta.tenantId}; ${cookieOptions}`;
  }
}

/**
 * Xóa sạch toàn bộ token (localStorage + cookies)
 */
function clearMainToken(): void {
  if (typeof window === "undefined") return;

  localStorage.removeItem(MAIN_TOKEN_KEY);
  localStorage.removeItem(MAIN_USER_KEY);

  // Xóa tất cả các cookie liên quan
  document.cookie = "auth_token=; path=/; max-age=0";
  document.cookie = "user_role=; path=/; max-age=0";
  document.cookie = "tenant_id=; path=/; max-age=0";
}

/**
 * Lấy tenantId từ cookie (dùng trong redirect sau login)
 */
export function getTenantIdFromCookie(): string {
  if (typeof window === "undefined") return "";
  const match = document.cookie.match(/tenant_id=([^;]+)/);
  return match?.[1] ?? "";
}

/**
 * Lấy role từ cookie
 */
export function getRoleFromCookie(): string {
  if (typeof window === "undefined") return "";
  const match = document.cookie.match(/user_role=([^;]+)/);
  return match?.[1] ?? "";
}

/**
 * Resolve URL redirect sau khi đăng nhập thành công, dựa vào role
 */
export function resolvePostLoginUrl(role: string, tenantId?: string | null): string {
  switch (role) {
    case UserRole.SYSTEM_ADMIN:
      return "/admin";
    case UserRole.BUSINESS_OWNER:
    case UserRole.CATALOG_MARKETING:
      return tenantId ? `/${tenantId}/business` : "/login?reason=NO_TENANT";
    default:
      return "/login?reason=UNKNOWN_ROLE";
  }
}

export default mainAuthAPI;
