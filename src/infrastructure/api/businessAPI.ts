/**
 * 🏢 Business API — Quản lý doanh nghiệp (UC-005 + UC-009)
 *
 * Admin (UC-005):
 *   GET  /api/v1/businesses              — Lấy danh sách doanh nghiệp
 *   POST /api/v1/businesses              — Tạo doanh nghiệp mới
 *   PUT  /api/v1/businesses/{id}/verify  — Phê duyệt / từ chối
 *
 * Business Owner / Catalog Team (UC-009):
 *   GET  /api/v1/businesses/profile      — Xem profile doanh nghiệp
 *   PUT  /api/v1/businesses/profile      — Cập nhật profile
 *
 * Quản lý thành viên Catalog Team (UC-009):
 *   POST   /api/v1/catalog-teams         — Thêm thành viên
 *   GET    /api/v1/catalog-teams         — Lấy danh sách
 *   GET    /api/v1/catalog-teams/{id}    — Lấy chi tiết
 *   PUT    /api/v1/catalog-teams/{id}    — Cập nhật
 *   DELETE /api/v1/catalog-teams/{id}    — Xóa
 */

import mainAxiosClient from "./mainAxiosClient";
import type {
  Business, BusinessStatus, BusinessRegistrationCommand, UpdateBusinessCommand, BusinessFilter,
  BusinessConfig, UpdateBusinessConfigCommand,
  CatalogMember, UserStatus, MemberRegistrationCommand, UpdateMemberCommand, MemberFilter,
  BusinessProfileDto,
} from "@/infrastructure/dto/BusinessDTO";
import type { MainApiWrapper, MainPaginatedList } from "@/infrastructure/dto/MainApiWrapper";

// Re-export DTOs để các component vẫn import được từ đây (backward compatible)
export type {
  Business, BusinessStatus, BusinessRegistrationCommand, UpdateBusinessCommand, BusinessFilter,
  BusinessConfig, UpdateBusinessConfigCommand,
  CatalogMember, UserStatus, MemberRegistrationCommand, UpdateMemberCommand, MemberFilter,
  BusinessProfileDto,
} from "@/infrastructure/dto/BusinessDTO";

// ── Business API ───────────────────────────────────────────────────────────────

export const businessAPI = {
  // ── Admin endpoints ──────────────────────────────────────────────────────────

  /** GET /api/v1/businesses — Admin lấy danh sách doanh nghiệp */
  getAll: async (filter?: BusinessFilter): Promise<MainApiWrapper<MainPaginatedList<Business>>> => {
    const { data } = await mainAxiosClient.get<MainApiWrapper<MainPaginatedList<Business>>>(
      "/businesses",
      { params: filter }
    );
    return data;
  },

  /** POST /api/v1/businesses — Admin tạo doanh nghiệp mới */
  create: async (body: BusinessRegistrationCommand): Promise<MainApiWrapper<Business>> => {
    const { data } = await mainAxiosClient.post<MainApiWrapper<Business>>(
      "/businesses",
      body
    );
    return data;
  },

  /** PUT /api/v1/businesses/{id}/verify — Admin phê duyệt / từ chối */
  verify: async (id: string, isApproved: boolean): Promise<MainApiWrapper<Business>> => {
    const { data } = await mainAxiosClient.put<MainApiWrapper<Business>>(
      `/businesses/${id}/verify`,
      null,
      { params: { isApproved } }
    );
    return data;
  },

  // ── BO/CT endpoints ──────────────────────────────────────────────────────────

  /** GET /api/v1/business-quotas — Lấy lịch sử tiêu hao token (Usage Logs) */
  getUsageLogs: async (filter?: any): Promise<MainApiWrapper<MainPaginatedList<any>>> => {
    const { data } = await mainAxiosClient.get<MainApiWrapper<MainPaginatedList<any>>>(
      "/business-quotas",
      { params: filter }
    );
    return data;
  },

  /** GET /api/v1/businesses/profile — BO/CT xem profile */
  getProfile: async (): Promise<MainApiWrapper<BusinessProfileDto>> => {
    const { data } = await mainAxiosClient.get<MainApiWrapper<BusinessProfileDto>>(
      "/businesses/profile"
    );
    return data;
  },

  /** PUT /api/v1/businesses/profile — BO/CT cập nhật profile */
  updateProfile: async (body: UpdateBusinessCommand): Promise<MainApiWrapper<Business>> => {
    const { data } = await mainAxiosClient.put<MainApiWrapper<Business>>(
      "/businesses/profile",
      body
    );
    return data;
  },

  /** GET /api/v1/businesses/config — BO lấy cấu hình chatbot */
  getConfig: async (): Promise<MainApiWrapper<BusinessConfig>> => {
    const { data } = await mainAxiosClient.get<MainApiWrapper<BusinessConfig>>(
      "/businesses/config"
    );
    return data;
  },

  /** PUT /api/v1/businesses/config — BO cập nhật cấu hình chatbot */
  updateConfig: async (body: UpdateBusinessConfigCommand): Promise<MainApiWrapper<any>> => {
    const { data } = await mainAxiosClient.put<MainApiWrapper<any>>(
      "/businesses/config",
      body
    );
    return data;
  },

  /** PUT /api/v1/businesses/config/default — BO khôi phục cấu hình chatbot mặc định */
  resetConfigDefault: async (): Promise<MainApiWrapper<any>> => {
    const { data } = await mainAxiosClient.put<MainApiWrapper<any>>(
      "/businesses/config/default"
    );
    return data;
  },
};

// ── Catalog Team API ───────────────────────────────────────────────────────────

export const catalogTeamAPI = {
  /** GET /api/v1/catalog-teams — Lấy danh sách thành viên */
  getAll: async (filter?: MemberFilter): Promise<MainApiWrapper<MainPaginatedList<CatalogMember>>> => {
    const { data } = await mainAxiosClient.get<MainApiWrapper<MainPaginatedList<CatalogMember>>>(
      "/catalog-teams",
      { params: filter }
    );
    return data;
  },

  /** GET /api/v1/catalog-teams/{id} — Lấy chi tiết thành viên */
  getById: async (id: string): Promise<MainApiWrapper<CatalogMember>> => {
    const { data } = await mainAxiosClient.get<MainApiWrapper<CatalogMember>>(
      `/catalog-teams/${id}`
    );
    return data;
  },

  /** POST /api/v1/catalog-teams — Thêm thành viên mới */
  create: async (body: MemberRegistrationCommand): Promise<MainApiWrapper<CatalogMember>> => {
    const { data } = await mainAxiosClient.post<MainApiWrapper<CatalogMember>>(
      "/catalog-teams",
      body
    );
    return data;
  },

  /** PUT /api/v1/catalog-teams/{id} — Cập nhật thành viên */
  update: async (id: string, body: UpdateMemberCommand): Promise<MainApiWrapper<CatalogMember>> => {
    const { data } = await mainAxiosClient.put<MainApiWrapper<CatalogMember>>(
      `/catalog-teams/${id}`,
      body
    );
    return data;
  },

  /** DELETE /api/v1/catalog-teams/{id} — Xóa thành viên */
  delete: async (id: string): Promise<MainApiWrapper<null>> => {
    const { data } = await mainAxiosClient.delete<MainApiWrapper<null>>(
      `/catalog-teams/${id}`
    );
    return data;
  },
};
