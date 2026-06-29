/**
 * 📋 System Content API — Quản lý chính sách nền tảng (UC-002)
 *
 * Admin:
 *   POST   /api/v1/system-contents          — Tạo nội dung/chính sách mới
 *   GET    /api/v1/system-contents          — Lấy danh sách
 *   PUT    /api/v1/system-contents/{id}     — Cập nhật
 *   DELETE /api/v1/system-contents/{id}     — Xóa (soft delete)
 *   GET    /api/v1/system-contents/{id}     — Lấy theo ID
 *
 * Public:
 *   GET    /api/v1/system-contents/key/{key} — Lấy nội dung đã publish theo key
 */

import mainAxiosClient from "./mainAxiosClient";
import type {
  SystemContent, ContentType, SystemContentStatus,
  CreateSystemContentCommand, UpdateSystemContentCommand, SystemContentFilter,
} from "@/infrastructure/dto/SystemContentDTO";
import type { MainApiWrapper, MainPaginatedList } from "@/infrastructure/dto/MainApiWrapper";

// Re-export DTOs
export type {
  SystemContent, ContentType, SystemContentStatus,
  CreateSystemContentCommand, UpdateSystemContentCommand, SystemContentFilter,
} from "@/infrastructure/dto/SystemContentDTO";

// ── System Content API ─────────────────────────────────────────────────────────

export const systemContentAPI = {
  /** GET /api/v1/system-contents — Lấy danh sách chính sách */
  getAll: async (filter?: SystemContentFilter): Promise<MainApiWrapper<MainPaginatedList<SystemContent>>> => {
    const { data } = await mainAxiosClient.get<MainApiWrapper<MainPaginatedList<SystemContent>>>(
      "/system-contents",
      { params: filter }
    );
    return data;
  },

  /** GET /api/v1/system-contents/{id} — Lấy chi tiết theo ID */
  getById: async (id: string): Promise<MainApiWrapper<SystemContent>> => {
    const { data } = await mainAxiosClient.get<MainApiWrapper<SystemContent>>(
      `/system-contents/${id}`
    );
    return data;
  },

  /** GET /api/v1/system-contents/key/{key} — Lấy nội dung đã publish theo key */
  getByKey: async (key: string): Promise<MainApiWrapper<SystemContent>> => {
    const { data } = await mainAxiosClient.get<MainApiWrapper<SystemContent>>(
      `/system-contents/key/${key}`
    );
    return data;
  },

  /** POST /api/v1/system-contents — Tạo nội dung mới */
  create: async (body: CreateSystemContentCommand): Promise<MainApiWrapper<SystemContent>> => {
    const { data } = await mainAxiosClient.post<MainApiWrapper<SystemContent>>(
      "/system-contents",
      body
    );
    return data;
  },

  /** PUT /api/v1/system-contents/{id} — Cập nhật nội dung */
  update: async (id: string, body: UpdateSystemContentCommand): Promise<MainApiWrapper<SystemContent>> => {
    const { data } = await mainAxiosClient.put<MainApiWrapper<SystemContent>>(
      `/system-contents/${id}`,
      body
    );
    return data;
  },

  /** DELETE /api/v1/system-contents/{id} — Xóa mềm */
  delete: async (id: string): Promise<MainApiWrapper<null>> => {
    const { data } = await mainAxiosClient.delete<MainApiWrapper<null>>(
      `/system-contents/${id}`
    );
    return data;
  },
};
