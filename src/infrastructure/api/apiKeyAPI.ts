/**
 * 🔑 API Keys Management — UC-010
 *
 * Dành cho Business Owner để quản lý Secret Keys dùng cho việc tích hợp hệ thống ngoài.
 *
 * Endpoints:
 *   POST   /api/v1/api-keys          — Tạo API key mới
 *   GET    /api/v1/api-keys          — Lấy danh sách API keys
 *   GET    /api/v1/api-keys/{id}     — Lấy chi tiết API key (chứa mã key gốc)
 *   DELETE /api/v1/api-keys/{id}     — Thu hồi/Xóa API key
 */

import mainAxiosClient from "./mainAxiosClient";
import type { MainApiWrapper } from "@/infrastructure/dto/MainApiWrapper";
import type { ApiKeyDto, ApiKeyDetailDto, CreateApiKeyRequest } from "@/infrastructure/dto/ApiKeyDTO";

// Re-export DTOs
export type { ApiKeyDto, ApiKeyDetailDto, CreateApiKeyRequest } from "@/infrastructure/dto/ApiKeyDTO";

// ── API Methods ────────────────────────────────────────────────────────────────

export const apiKeyAPI = {
  /**
   * Lấy danh sách tất cả API keys của tenant hiện tại (dựa vào token của BO)
   */
  getAll: async (): Promise<MainApiWrapper<ApiKeyDto[]>> => {
    const { data } = await mainAxiosClient.get<MainApiWrapper<ApiKeyDto[]>>(
      "/api-keys"
    );
    return data;
  },

  /**
   * Lấy chi tiết một API key (sẽ chứa keyValue đầy đủ)
   * @param id ID của API Key
   */
  getById: async (id: string): Promise<MainApiWrapper<ApiKeyDetailDto>> => {
    const { data } = await mainAxiosClient.get<MainApiWrapper<ApiKeyDetailDto>>(
      `/api-keys/${id}`
    );
    return data;
  },

  /**
   * Tạo một API Key mới
   * @param payload Thông tin tạo API Key
   */
  create: async (payload: CreateApiKeyRequest): Promise<MainApiWrapper<ApiKeyDetailDto>> => {
    const { data } = await mainAxiosClient.post<MainApiWrapper<ApiKeyDetailDto>>(
      "/api-keys",
      payload
    );
    return data;
  },

  /**
   * Thu hồi / Xóa một API Key
   * @param id ID của API Key cần xóa
   */
  revoke: async (id: string): Promise<MainApiWrapper<null>> => {
    const { data } = await mainAxiosClient.delete<MainApiWrapper<null>>(
      `/api-keys/${id}`
    );
    return data;
  },
};
