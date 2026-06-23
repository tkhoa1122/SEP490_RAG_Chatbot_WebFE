/**
 * 👥 User API — Quản lý người dùng (UC-005 Admin + UC-003 Quota)
 *
 * Admin:
 *   GET    /api/v1/users       — Lấy danh sách người dùng
 *   GET    /api/v1/users/{id}  — Lấy chi tiết
 *   PUT    /api/v1/users/{id}  — Cập nhật
 *   DELETE /api/v1/users/{id}  — Xóa
 */

import mainAxiosClient from "./mainAxiosClient";

// ── Types ──────────────────────────────────────────────────────────────────────

export type UserStatus = "ACTIVE" | "DELETED" | "PENDING_PROFILE_COMPLETION" | "PENDING_APPROVAL" | "REJECTED";

export interface UserRecord {
  id: string;
  email?: string;
  fullName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: number;
  status?: UserStatus;
  isEmailVerified?: boolean;
  role?: string;
  tenantId?: string | null;
  createdAt?: string;
}

export interface UpdateUserCommand {
  fullName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: number;
}

export interface UserFilter {
  FullName?: string;
  Email?: string;
  IsEmailVerified?: boolean;
  Gender?: number;
  UserStatus?: UserStatus;
  OrderBy?: string;
  PageIndex?: number;
  PageSize?: number;
}

interface ApiWrapper<T> {
  success?: boolean;
  message?: string;
  data?: T;
}

interface PaginatedData<T> {
  items: T[];
  totalCount?: number;
  pageIndex?: number;
  pageSize?: number;
}

// ── User API ───────────────────────────────────────────────────────────────────

export const userAPI = {
  /** GET /api/v1/users — Lấy danh sách người dùng */
  getAll: async (filter?: UserFilter): Promise<ApiWrapper<PaginatedData<UserRecord>>> => {
    const { data } = await mainAxiosClient.get<ApiWrapper<PaginatedData<UserRecord>>>(
      "/users",
      { params: filter }
    );
    return data;
  },

  /** GET /api/v1/users/{id} — Lấy chi tiết người dùng */
  getById: async (id: string): Promise<ApiWrapper<UserRecord>> => {
    const { data } = await mainAxiosClient.get<ApiWrapper<UserRecord>>(
      `/users/${id}`
    );
    return data;
  },

  /** PUT /api/v1/users/{id} — Cập nhật thông tin người dùng */
  update: async (id: string, body: UpdateUserCommand): Promise<ApiWrapper<UserRecord>> => {
    const { data } = await mainAxiosClient.put<ApiWrapper<UserRecord>>(
      `/users/${id}`,
      body
    );
    return data;
  },

  /** DELETE /api/v1/users/{id} — Xóa người dùng */
  delete: async (id: string): Promise<ApiWrapper<null>> => {
    const { data } = await mainAxiosClient.delete<ApiWrapper<null>>(
      `/users/${id}`
    );
    return data;
  },
};
