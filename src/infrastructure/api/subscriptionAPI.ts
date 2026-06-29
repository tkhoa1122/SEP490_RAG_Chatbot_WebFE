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
import type {
  Subscription, StatusEnums, SubscriptionAddCommand, SubscriptionUpdateCommand, SubscriptionFilter,
  Payment, PaymentStatus, PaymentFilter,
} from "@/infrastructure/dto/SubscriptionDTO";
import type { MainApiWrapper, MainPaginatedList } from "@/infrastructure/dto/MainApiWrapper";

// Re-export DTOs
export type {
  Subscription, StatusEnums, SubscriptionAddCommand, SubscriptionUpdateCommand, SubscriptionFilter,
  Payment, PaymentStatus, PaymentFilter,
} from "@/infrastructure/dto/SubscriptionDTO";

// ── Subscription API ───────────────────────────────────────────────────────────

export const subscriptionAPI = {
  /** GET /api/v1/subscriptions — Lấy danh sách gói */
  getAll: async (filter?: SubscriptionFilter): Promise<MainApiWrapper<MainPaginatedList<Subscription>>> => {
    const { data } = await mainAxiosClient.get<MainApiWrapper<MainPaginatedList<Subscription>>>(
      "/subscriptions",
      { params: filter }
    );
    return data;
  },

  /** POST /api/v1/subscriptions — Tạo gói mới */
  create: async (body: SubscriptionAddCommand): Promise<MainApiWrapper<Subscription>> => {
    const { data } = await mainAxiosClient.post<MainApiWrapper<Subscription>>(
      "/subscriptions",
      body
    );
    return data;
  },

  /** PUT /api/v1/subscriptions/{id} — Cập nhật gói */
  update: async (id: string, body: SubscriptionUpdateCommand): Promise<MainApiWrapper<Subscription>> => {
    const { data } = await mainAxiosClient.put<MainApiWrapper<Subscription>>(
      `/subscriptions/${id}`,
      body
    );
    return data;
  },

  /** DELETE /api/v1/subscriptions/{id} — Xóa gói */
  delete: async (id: string): Promise<MainApiWrapper<null>> => {
    const { data } = await mainAxiosClient.delete<MainApiWrapper<null>>(
      `/subscriptions/${id}`
    );
    return data;
  },
};

// ── Payment API (UC-008: Xem usage/billing) ───────────────────────────────────

export const paymentAPI = {
  /** GET /api/v1/payments — Lấy lịch sử thanh toán */
  getAll: async (filter?: PaymentFilter): Promise<MainApiWrapper<MainPaginatedList<Payment>>> => {
    const { data } = await mainAxiosClient.get<MainApiWrapper<MainPaginatedList<Payment>>>(
      "/payments",
      { params: filter }
    );
    return data;
  },

  /** GET /api/v1/payments/order/{orderCode} — Lấy chi tiết đơn thanh toán (UC-003/UC-008) */
  getByOrderCode: async (orderCode: number): Promise<MainApiWrapper<Payment>> => {
    const { data } = await mainAxiosClient.get<MainApiWrapper<Payment>>(
      `/payments/order/${orderCode}`
    );
    return data;
  },

  /** POST /api/v1/payments — Tạo link thanh toán */
  createPaymentLink: async (body: {
    subscriptionPlanId: string;
    bussinessId: string;
    returnUrlDomain: string;
  }): Promise<MainApiWrapper<{ paymentUrl: string }>> => {
    const { data } = await mainAxiosClient.post<MainApiWrapper<{ paymentUrl: string }>>(
      "/payments",
      body
    );
    return data;
  },
};
