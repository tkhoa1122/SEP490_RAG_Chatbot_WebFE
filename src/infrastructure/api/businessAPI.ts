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

// ── Types ──────────────────────────────────────────────────────────────────────

export type BusinessStatus = "REJECTED" | "ACTIVE" | "DELETED" | "PENDING_APPROVAL";

export interface Business {
  id: string;
  businessName?: string;
  businessOwnerEmail?: string;
  businessOwnerName?: string;
  hotLine?: string;
  websiteUrl?: string;
  addressLine?: string;
  status?: BusinessStatus;
  createdAt?: string;
}

export interface BusinessRegistrationCommand {
  businessName: string;
  businessOwnerEmail: string;
  businessOwnerName: string;
  hotLine?: string;
  websiteUrl?: string;
  addressLine?: string;
}

export interface UpdateBusinessCommand {
  businessName?: string;
  hotLine?: string;
  websiteUrl?: string;
  addressLine?: string;
}

export interface BusinessFilter {
  Search?: string;
  Status?: BusinessStatus;
  CreatedFrom?: string;
  PageIndex?: number;
  PageSize?: number;
}

// Catalog Team
export type UserStatus = "ACTIVE" | "DELETED" | "PENDING_PROFILE_COMPLETION" | "PENDING_APPROVAL" | "REJECTED";

export interface CatalogMember {
  id: string;
  email?: string;
  fullName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: number;
  status?: UserStatus;
  isEmailVerified?: boolean;
}

export interface MemberRegistrationCommand {
  email: string;
  fullName: string;
}

export interface UpdateMemberCommand {
  fullName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: number;
}

export interface MemberFilter {
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

// ── Business API ───────────────────────────────────────────────────────────────

export const businessAPI = {
  // ── Admin endpoints ──────────────────────────────────────────────────────────

  /** GET /api/v1/businesses — Admin lấy danh sách doanh nghiệp */
  getAll: async (filter?: BusinessFilter): Promise<ApiWrapper<PaginatedData<Business>>> => {
    const { data } = await mainAxiosClient.get<ApiWrapper<PaginatedData<Business>>>(
      "/businesses",
      { params: filter }
    );
    return data;
  },

  /** POST /api/v1/businesses — Admin tạo doanh nghiệp mới */
  create: async (body: BusinessRegistrationCommand): Promise<ApiWrapper<Business>> => {
    const { data } = await mainAxiosClient.post<ApiWrapper<Business>>(
      "/businesses",
      body
    );
    return data;
  },

  /** PUT /api/v1/businesses/{id}/verify — Admin phê duyệt / từ chối */
  verify: async (id: string, isApproved: boolean): Promise<ApiWrapper<Business>> => {
    const { data } = await mainAxiosClient.put<ApiWrapper<Business>>(
      `/businesses/${id}/verify`,
      null,
      { params: { isApproved } }
    );
    return data;
  },

  // ── BO/CT endpoints ──────────────────────────────────────────────────────────

  /** GET /api/v1/businesses/profile — BO/CT xem profile */
  getProfile: async (): Promise<ApiWrapper<Business>> => {
    const { data } = await mainAxiosClient.get<ApiWrapper<Business>>(
      "/businesses/profile"
    );
    return data;
  },

  /** PUT /api/v1/businesses/profile — BO/CT cập nhật profile */
  updateProfile: async (body: UpdateBusinessCommand): Promise<ApiWrapper<Business>> => {
    const { data } = await mainAxiosClient.put<ApiWrapper<Business>>(
      "/businesses/profile",
      body
    );
    return data;
  },
};

// ── Catalog Team API ───────────────────────────────────────────────────────────

export const catalogTeamAPI = {
  /** GET /api/v1/catalog-teams — Lấy danh sách thành viên */
  getAll: async (filter?: MemberFilter): Promise<ApiWrapper<PaginatedData<CatalogMember>>> => {
    const { data } = await mainAxiosClient.get<ApiWrapper<PaginatedData<CatalogMember>>>(
      "/catalog-teams",
      { params: filter }
    );
    return data;
  },

  /** GET /api/v1/catalog-teams/{id} — Lấy chi tiết thành viên */
  getById: async (id: string): Promise<ApiWrapper<CatalogMember>> => {
    const { data } = await mainAxiosClient.get<ApiWrapper<CatalogMember>>(
      `/catalog-teams/${id}`
    );
    return data;
  },

  /** POST /api/v1/catalog-teams — Thêm thành viên mới */
  create: async (body: MemberRegistrationCommand): Promise<ApiWrapper<CatalogMember>> => {
    const { data } = await mainAxiosClient.post<ApiWrapper<CatalogMember>>(
      "/catalog-teams",
      body
    );
    return data;
  },

  /** PUT /api/v1/catalog-teams/{id} — Cập nhật thành viên */
  update: async (id: string, body: UpdateMemberCommand): Promise<ApiWrapper<CatalogMember>> => {
    const { data } = await mainAxiosClient.put<ApiWrapper<CatalogMember>>(
      `/catalog-teams/${id}`,
      body
    );
    return data;
  },

  /** DELETE /api/v1/catalog-teams/{id} — Xóa thành viên */
  delete: async (id: string): Promise<ApiWrapper<null>> => {
    const { data } = await mainAxiosClient.delete<ApiWrapper<null>>(
      `/catalog-teams/${id}`
    );
    return data;
  },
};
