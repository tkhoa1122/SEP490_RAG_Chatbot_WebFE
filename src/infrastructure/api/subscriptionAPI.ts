/**
 * 📦 Subscription API — Quản lý gói cước (UC-004 + UC-008)
 *
 * Admin:
 *   POST   /api/v1/subscriptions          — Tạo gói mới
 *   GET    /api/v1/subscriptions          — Lấy danh sách gói
 *   PUT    /api/v1/subscriptions/{id}     — Cập nhật gói
 *   DELETE /api/v1/subscriptions/{id}     — Xóa gói
 *
 * Business Owner (UC-008):
 *   GET    /api/v1/subscriptions          — Xem gói đang dùng
 *   GET    /api/v1/payments/order/{code}  — Xem chi tiết đơn hàng/thanh toán
 *   GET    /api/v1/payments               — Lịch sử thanh toán
 */

import mainAxiosClient from "./mainAxiosClient";

// ── Types ──────────────────────────────────────────────────────────────────────

export type StatusEnums = "Active" | "Inactive";

export interface Subscription {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  duration: number;          // số ngày
  tokenLimit: number;
  messageLimit: number;
  maxProductAllowed: number;
  status?: StatusEnums;
  createdAt?: string;
}

export interface SubscriptionAddCommand {
  name: string;
  description?: string;
  price: number;
  duration: number;
  tokenLimit: number;
  messageLimit: number;
  maxProductAllowed: number;
}

export interface SubscriptionUpdateCommand extends SubscriptionAddCommand {}

export interface SubscriptionFilter {
  "Filter.Search"?: string;
  "Filter.Status"?: StatusEnums;
  "Filter.PageIndex"?: number;
  "Filter.PageSize"?: number;
}

// Payment
export type PaymentStatus = "Pending" | "Completed" | "Failed" | "Cancelled";

export interface Payment {
  id?: string;
  orderCode?: number;
  amount?: number;
  description?: string;
  status?: PaymentStatus;
  createdAt?: string;
  subscriptionName?: string;
  businessId?: string;
}

export interface PaymentFilter {
  "Filter.Search"?: string;
  "Filter.PaymentEnums"?: PaymentStatus;
  "Filter.CreateAtOrderBy"?: string;
  "Filter.PageIndex"?: number;
  "Filter.PageSize"?: number;
}

// Wrapper phổ biến
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

// ── Subscription API ───────────────────────────────────────────────────────────

export const subscriptionAPI = {
  /** GET /api/v1/subscriptions — Lấy danh sách gói */
  getAll: async (filter?: SubscriptionFilter): Promise<ApiWrapper<PaginatedData<Subscription>>> => {
    const { data } = await mainAxiosClient.get<ApiWrapper<PaginatedData<Subscription>>>(
      "/subscriptions",
      { params: filter }
    );
    return data;
  },

  /** POST /api/v1/subscriptions — Tạo gói mới */
  create: async (body: SubscriptionAddCommand): Promise<ApiWrapper<Subscription>> => {
    const { data } = await mainAxiosClient.post<ApiWrapper<Subscription>>(
      "/subscriptions",
      body
    );
    return data;
  },

  /** PUT /api/v1/subscriptions/{id} — Cập nhật gói */
  update: async (id: string, body: SubscriptionUpdateCommand): Promise<ApiWrapper<Subscription>> => {
    const { data } = await mainAxiosClient.put<ApiWrapper<Subscription>>(
      `/subscriptions/${id}`,
      body
    );
    return data;
  },

  /** DELETE /api/v1/subscriptions/{id} — Xóa gói */
  delete: async (id: string): Promise<ApiWrapper<null>> => {
    const { data } = await mainAxiosClient.delete<ApiWrapper<null>>(
      `/subscriptions/${id}`
    );
    return data;
  },
};

// ── Payment API (UC-008: Xem usage/billing) ───────────────────────────────────

export const paymentAPI = {
  /** GET /api/v1/payments — Lấy lịch sử thanh toán */
  getAll: async (filter?: PaymentFilter): Promise<ApiWrapper<PaginatedData<Payment>>> => {
    const { data } = await mainAxiosClient.get<ApiWrapper<PaginatedData<Payment>>>(
      "/payments",
      { params: filter }
    );
    return data;
  },

  /** GET /api/v1/payments/order/{orderCode} — Lấy chi tiết đơn thanh toán (UC-003/UC-008) */
  getByOrderCode: async (orderCode: number): Promise<ApiWrapper<Payment>> => {
    const { data } = await mainAxiosClient.get<ApiWrapper<Payment>>(
      `/payments/order/${orderCode}`
    );
    return data;
  },

  /** POST /api/v1/payments — Tạo link thanh toán */
  createPaymentLink: async (body: {
    subscriptionPlanId: string;
    bussinessId: string;
    returnUrlDomain: string;
  }): Promise<ApiWrapper<{ paymentUrl: string }>> => {
    const { data } = await mainAxiosClient.post<ApiWrapper<{ paymentUrl: string }>>(
      "/payments",
      body
    );
    return data;
  },
};
