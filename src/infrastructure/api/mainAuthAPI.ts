/**
 * 🔐 Main Auth API — Dành cho Admin / Business Owner / Catalog Team
 *
 * Gọi Main DB (đi qua Next.js Proxy ở /api/v1)
 * KHÔNG dùng cho Buyer (dùng authAPI.ts cho Buyer).
 *
 * Endpoints:
 *   POST /api/v1/auth/login  — { email, password }
 *   GET  /api/v1/auth/me     — Lấy profile người dùng hiện tại
 *
 * Token được lưu hoàn toàn ở Cookie để Middleware và SSR đọc được:
 *   Cookie: "auth_token" + "user_role" + "tenant_id"
 */

import mainAxiosClient, { MAIN_USER_KEY } from "./mainAxiosClient";
import { UserRole } from "@/domain/entities/User";
import type { LoginRequest, LoginResponse, MeResponse } from "@/infrastructure/dto/AuthDTO";
import type { MainApiWrapper } from "@/infrastructure/dto/MainApiWrapper";

// Re-export DTOs để các component vẫn import được từ đây (backward compatible)
export type { LoginRequest, LoginResponse, MeResponse } from "@/infrastructure/dto/AuthDTO";
export type { MainApiWrapper } from "@/infrastructure/dto/MainApiWrapper";

// ── JWT Decoder ────────────────────────────────────────────────────────────────

/** Giải mã JWT payload mà không cần thư viện ngoài */
export function decodeJwtPayload(token: string): Record<string, unknown> {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const jsonPayload = new TextDecoder("utf-8").decode(bytes);
    return JSON.parse(jsonPayload);
  } catch {
    return {};
  }
}

/**
 * Map role từ JWT claim sang UserRole enum của app.
 * BE trả về "ADMIN", "BUSINESS_OWNER", "CATALOG_MARKETING", v.v.
 */
function mapJwtRoleToUserRole(jwtRole: string): string {
  const roleMap: Record<string, string> = {
    ADMIN: UserRole.SYSTEM_ADMIN,
    SYSTEM_ADMIN: UserRole.SYSTEM_ADMIN,
    BUSINESS_OWNER: UserRole.BUSINESS_OWNER,
    CATALOG_MARKETING: UserRole.CATALOG_MARKETING,
    CATALOG_TEAM: UserRole.CATALOG_MARKETING, // Map CATALOG_TEAM từ BE sang CATALOG_MARKETING của FE
    CUSTOMER: UserRole.CUSTOMER,
  };
  return roleMap[jwtRole] ?? jwtRole;
}

// ── Main Auth API ──────────────────────────────────────────────────────────────

export const mainAuthAPI = {
  /**
   * Đăng nhập dành cho Admin / BO / CT
   * POST /api/v1/auth/login
   */
  login: async (request: LoginRequest): Promise<MainApiWrapper<LoginResponse>> => {
    const { data } = await mainAxiosClient.post<any>(
      "/auth/login",
      request
    );

    // BE trả về: { isSuccess, message, data: { accessToken, isEmailVerified, ... } }
    const payload = data.data || data;
    const token = payload.accessToken || payload.token;

    if (token) {
      // Giải mã JWT để lấy role và tenantId
      const jwtPayload = decodeJwtPayload(token);
      console.log("🔑 [Login] JWT decoded:", jwtPayload);

      let rawRole = (
        jwtPayload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
        jwtPayload["role"] ||
        ""
      );
      if (Array.isArray(rawRole)) rawRole = rawRole[0];
      
      const role = mapJwtRoleToUserRole(rawRole as string);
      const tenantId = (jwtPayload["businessSlug"] || jwtPayload["tenantId"] || null) as string | null;
      
      const serverApiKey = payload.apiKey || jwtPayload.apiKey || jwtPayload.ApiKey || jwtPayload["api-key"];
      if (serverApiKey) {
        localStorage.setItem("bo_api_key", serverApiKey as string);
      }

      // Lưu token + cookies
      saveMainToken(token, { role, tenantId, rememberMe: request.rememberMe });

      return {
        isSuccess: true,
        success: true,
        message: data.message,
        data: {
          accessToken: token,
          isEmailVerified: payload.isEmailVerified,
          isProfileCompleted: payload.isProfileCompleted,
          role,
          tenantId,
        },
      };
    }

    return data as MainApiWrapper<LoginResponse>;
  },

  /**
   * Lấy thông tin profile người dùng hiện tại
   * GET /api/v1/auth/me
   */
  getMe: async (): Promise<MainApiWrapper<MeResponse>> => {
    const { data } = await mainAxiosClient.get<MainApiWrapper<MeResponse>>("/auth/me");
    return data;
  },

  /**
   * Đăng xuất — xóa token khỏi cookies
   */
  logout: (): void => {
    clearMainToken();
  },

  /**
   * Lấy token từ cookie
   */
  getToken: (): string | null => {
    if (typeof window === "undefined") return null;
    const match = document.cookie.match(new RegExp('(^| )auth_token=([^;]+)'));
    return match ? match[2] : null;
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

  /**
   * Cập nhật thông tin cá nhân
   * PUT /api/v1/auth/update-profile
   */
  updateProfile: async (body: { fullName: string; phoneNumber?: string }): Promise<MainApiWrapper<MeResponse>> => {
    const { data } = await mainAxiosClient.put<MainApiWrapper<MeResponse>>("/auth/update-profile", body);
    return data;
  },

  /**
   * Đổi mật khẩu
   * PUT /api/v1/auth/change-password
   */
  changePassword: async (body: { currentPassword: string; newPassword: string; confirmNewPassword: string }): Promise<MainApiWrapper<null>> => {
    const { data } = await mainAxiosClient.put<MainApiWrapper<null>>("/auth/change-password", body);
    return data;
  },

  /**
   * Quên mật khẩu
   * POST /api/v1/auth/forgot-password
   */
  forgotPassword: async (body: { email: string }): Promise<MainApiWrapper<null>> => {
    const { data } = await mainAxiosClient.post<MainApiWrapper<null>>("/auth/forgot-password", body);
    return data;
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Lưu token vào cookies (để middleware Next.js và Axios đọc được)
 */
function saveMainToken(
  token: string,
  meta: { role?: string; tenantId?: string | null; rememberMe?: boolean }
): void {
  if (typeof window === "undefined") return;

  // Cookie — middleware & server component đọc được
  let cookieOptions = "path=/; SameSite=Lax";
  if (meta.rememberMe) {
    const expires = new Date();
    expires.setDate(expires.getDate() + 7); // 7 ngày
    cookieOptions += `; expires=${expires.toUTCString()}`;
  }

  // Ghi đè auth_token cookie
  document.cookie = `auth_token=${token}; ${cookieOptions}`;

  // Ghi role để middleware phân quyền route
  if (meta.role) {
    document.cookie = `user_role=${meta.role}; ${cookieOptions}`;
  }

  // Ghi tenant_id để middleware điều hướng BO/CT đúng workspace
  if (meta.tenantId) {
    document.cookie = `tenant_id=${encodeURIComponent(meta.tenantId)}; ${cookieOptions}`;
  }
}

/**
 * Xóa sạch toàn bộ token ở cookies
 */
function clearMainToken(): void {
  if (typeof window === "undefined") return;

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
  return match?.[1] ? decodeURIComponent(match[1]) : "";
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
      return tenantId ? `/${encodeURIComponent(tenantId)}/business` : "/login?reason=NO_TENANT";
    default:
      return "/login?reason=UNKNOWN_ROLE";
  }
}

export default mainAuthAPI;
