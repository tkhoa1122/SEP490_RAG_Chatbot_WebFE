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
import type { UserRecord, UserStatus, UpdateUserCommand, UserFilter } from "@/infrastructure/dto/UserDTO";
import type { MainApiWrapper, MainPaginatedList } from "@/infrastructure/dto/MainApiWrapper";

// Re-export DTOs
export type { UserRecord, UserStatus, UpdateUserCommand, UserFilter } from "@/infrastructure/dto/UserDTO";

// ── User API ───────────────────────────────────────────────────────────────────

export const userAPI = {
  /** GET /api/v1/users — Lấy danh sách người dùng */
  getAll: async (filter?: UserFilter): Promise<MainApiWrapper<MainPaginatedList<UserRecord>>> => {
    const { data } = await mainAxiosClient.get<MainApiWrapper<MainPaginatedList<UserRecord>>>(
      "/users",
      { params: filter }
    );
    return data;
  },

  /** GET /api/v1/users/{id} — Lấy chi tiết người dùng */
  getById: async (id: string): Promise<MainApiWrapper<UserRecord>> => {
    const { data } = await mainAxiosClient.get<MainApiWrapper<UserRecord>>(
      `/users/${id}`
    );
    return data;
  },

  /** PUT /api/v1/users/{id} — Cập nhật thông tin người dùng */
  update: async (id: string, body: UpdateUserCommand): Promise<MainApiWrapper<UserRecord>> => {
    const { data } = await mainAxiosClient.put<MainApiWrapper<UserRecord>>(
      `/users/${id}`,
      body
    );
    return data;
  },

  /** DELETE /api/v1/users/{id} — Xóa người dùng */
  delete: async (id: string): Promise<MainApiWrapper<null>> => {
    const { data } = await mainAxiosClient.delete<MainApiWrapper<null>>(
      `/users/${id}`
    );
    return data;
  },
};
