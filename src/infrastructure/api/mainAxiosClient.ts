/**
 * 🔐 Main Axios Client — Smart Shopping ChatBot Main DB
 *
 * Tách hoàn toàn khỏi axiosClient.ts (ShoppeFake) để đảm bảo:
 * - Token của Admin/BO/CT không bao giờ lẫn với token của Buyer
 * - Mỗi hệ thống có interceptor riêng, redirect riêng
 * - Dễ thay URL khi deploy: chỉ đổi NEXT_PUBLIC_MAIN_API_URL trong .env
 */

import axios, { type AxiosInstance } from "axios";

// ── Constants ──────────────────────────────────────────────────────────────────
// Chúng ta lưu thông tin User (không nhạy cảm) vào localStorage để hiện UI nhanh
export const MAIN_USER_KEY = "main_auth_user";

// Sử dụng Proxy của Next.js (cấu hình trong next.config.ts) thay vì gọi thẳng
export const MAIN_API_BASE_URL = "/api/v1";

// ── Axios Instance ─────────────────────────────────────────────────────────────
const mainAxiosClient: AxiosInstance = axios.create({
  baseURL: MAIN_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000, // 15 giây timeout
});

// ── Request Interceptor: gắn JWT token từ Cookie ─────────────────────────────
mainAxiosClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      // Đọc auth_token từ Cookie (dùng chung cho cả SSR Middleware và Client)
      const match = document.cookie.match(new RegExp('(^| )auth_token=([^;]+)'));
      const token = match ? match[2] : null;
      
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

import { translateValidationError } from "./ValidationTranslator";

// ── Response Interceptor: xử lý lỗi toàn cục ─────────────────────────────────
mainAxiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Xử lý lỗi Unauthorized (401)
    if (error.response?.status === 401 && typeof window !== "undefined") {
      // Xóa thông tin user ở LocalStorage
      localStorage.removeItem(MAIN_USER_KEY);
      
      // Xóa token ở Cookie
      document.cookie = "auth_token=; path=/; max-age=0";
      document.cookie = "user_role=; path=/; max-age=0";
      document.cookie = "tenant_id=; path=/; max-age=0";
      
      // Chuyển hướng cứng về trang login nếu đang không ở trang login
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    // Xử lý lỗi Validation (400) từ .NET Core
    if (error.response?.status === 400 && error.response?.data) {
      const data = error.response.data;
      const errorMessages = [];
      
      if (data.errors && typeof data.errors === "object") {
        // Gộp tất cả các mảng lỗi lại thành 1 chuỗi
        for (const [field, messages] of Object.entries(data.errors)) {
          if (Array.isArray(messages)) {
            const fieldErrs = messages.map(msg => translateValidationError(String(msg)));
            errorMessages.push(`${field}: ${fieldErrs.join(", ")}`);
          } else if (typeof messages === "string") {
            errorMessages.push(`${field}: ${translateValidationError(messages)}`);
          }
        }
      }
      
      if (errorMessages.length > 0) {
        error.response.data.message = errorMessages.join(" | ");
      } else if (data.detail) {
        error.response.data.message = translateValidationError(data.detail);
      } else if (data.title) {
        error.response.data.message = translateValidationError(data.title);
      } else if (data.message) {
        // Có thể backend trả về thẳng message
        error.response.data.message = translateValidationError(data.message);
      }
    }

    return Promise.reject(error);
  }
);

export default mainAxiosClient;
