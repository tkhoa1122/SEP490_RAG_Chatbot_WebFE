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
// Token key khác hoàn toàn so với Buyer (auth_token) để tránh xung đột
export const MAIN_TOKEN_KEY = "main_auth_token";
export const MAIN_USER_KEY = "main_auth_user";

export const MAIN_API_BASE_URL =
  process.env.NEXT_PUBLIC_MAIN_API_URL ?? "http://localhost:5000/api/v1";

// ── Axios Instance ─────────────────────────────────────────────────────────────
const mainAxiosClient: AxiosInstance = axios.create({
  baseURL: MAIN_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000, // 15 giây timeout
});

// ── Request Interceptor: gắn JWT token của Admin/BO/CT ────────────────────────
mainAxiosClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem(MAIN_TOKEN_KEY);
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor: xử lý lỗi toàn cục ─────────────────────────────────
mainAxiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      // Token hết hạn hoặc không hợp lệ → xóa token và redirect về trang login quản trị
      localStorage.removeItem(MAIN_TOKEN_KEY);
      localStorage.removeItem(MAIN_USER_KEY);
      // Xóa cả cookie để middleware nhận biết
      document.cookie = `${MAIN_TOKEN_KEY}=; path=/; max-age=0`;
      document.cookie = "auth_token=; path=/; max-age=0";
      document.cookie = "user_role=; path=/; max-age=0";
      // Middleware sẽ tự redirect về /login khi cookie trống
    }
    return Promise.reject(error);
  }
);

export default mainAxiosClient;
