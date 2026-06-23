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

// ── Types ──────────────────────────────────────────────────────────────────────

export type ContentType = "Markdown" | "Html";
export type SystemContentStatus = "Draft" | "Published" | "Deleted";

export interface SystemContent {
  id: string;
  title?: string;
  key?: string;
  content?: string;
  contentType?: ContentType;
  status?: SystemContentStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSystemContentCommand {
  title: string;
  key: string;
  content: string;
  contentType: ContentType;
  status: SystemContentStatus;
}

export interface UpdateSystemContentCommand {
  title?: string;
  key?: string;
  content?: string;
  contentType?: ContentType;
  status?: SystemContentStatus;
}

export interface SystemContentFilter {
  Title?: string;
  Key?: string;
  ContentType?: ContentType;
  Status?: SystemContentStatus;
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

// ── System Content API ─────────────────────────────────────────────────────────

export const systemContentAPI = {
  /** GET /api/v1/system-contents — Lấy danh sách chính sách */
  getAll: async (filter?: SystemContentFilter): Promise<ApiWrapper<PaginatedData<SystemContent>>> => {
    const { data } = await mainAxiosClient.get<ApiWrapper<PaginatedData<SystemContent>>>(
      "/system-contents",
      { params: filter }
    );
    return data;
  },

  /** GET /api/v1/system-contents/{id} — Lấy chi tiết theo ID */
  getById: async (id: string): Promise<ApiWrapper<SystemContent>> => {
    const { data } = await mainAxiosClient.get<ApiWrapper<SystemContent>>(
      `/system-contents/${id}`
    );
    return data;
  },

  /** GET /api/v1/system-contents/key/{key} — Lấy nội dung đã publish theo key */
  getByKey: async (key: string): Promise<ApiWrapper<SystemContent>> => {
    const { data } = await mainAxiosClient.get<ApiWrapper<SystemContent>>(
      `/system-contents/key/${key}`
    );
    return data;
  },

  /** POST /api/v1/system-contents — Tạo nội dung mới */
  create: async (body: CreateSystemContentCommand): Promise<ApiWrapper<SystemContent>> => {
    const { data } = await mainAxiosClient.post<ApiWrapper<SystemContent>>(
      "/system-contents",
      body
    );
    return data;
  },

  /** PUT /api/v1/system-contents/{id} — Cập nhật nội dung */
  update: async (id: string, body: UpdateSystemContentCommand): Promise<ApiWrapper<SystemContent>> => {
    const { data } = await mainAxiosClient.put<ApiWrapper<SystemContent>>(
      `/system-contents/${id}`,
      body
    );
    return data;
  },

  /** DELETE /api/v1/system-contents/{id} — Xóa mềm */
  delete: async (id: string): Promise<ApiWrapper<null>> => {
    const { data } = await mainAxiosClient.delete<ApiWrapper<null>>(
      `/system-contents/${id}`
    );
    return data;
  },
};
