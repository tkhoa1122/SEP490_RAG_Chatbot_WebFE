/**
 * 🌐 External Axios Client — Smart Shopping ChatBot External API
 *
 * Dùng cho các endpoints thuộc External API (swagger/external):
 *   - POST /api/v1/product — BO tạo/đồng bộ sản phẩm từ Dashboard
 *
 * Cùng base URL với mainAxiosClient (localhost:5000) nhưng:
 *   - Tách biệt về mục đích: đây là API dành cho bên ngoài tích hợp vào hệ thống
 *   - Vẫn dùng JWT Bearer token của Admin/BO/CT (vì BO login từ Dashboard)
 *   - Khi web bên ngoài gọi, họ dùng API Key (thay vì JWT)
 *
 * Biến môi trường: NEXT_PUBLIC_EXTERNAL_API_URL (mặc định cùng với MAIN_API_URL)
 */

import axios, { type AxiosInstance } from "axios";
import { MAIN_TOKEN_KEY } from "./mainAxiosClient";

// ── Base URL ───────────────────────────────────────────────────────────────────
// External API nằm trên cùng server với Internal API (localhost:5000)
// Khi deploy, có thể tách ra server khác bằng cách đổi biến môi trường
export const EXTERNAL_API_BASE_URL =
  process.env.NEXT_PUBLIC_EXTERNAL_API_URL ??
  process.env.NEXT_PUBLIC_MAIN_API_URL ??
  "http://localhost:5000/api/v1";

// ── Axios Instance ─────────────────────────────────────────────────────────────
const externalAxiosClient: AxiosInstance = axios.create({
  baseURL: EXTERNAL_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 20000, // 20 giây — upload sản phẩm có thể lâu hơn
});

// ── Request Interceptor: gắn JWT token của Admin/BO/CT ────────────────────────
// BO truy cập từ Dashboard → dùng JWT token như Internal API
// Web bên ngoài → truyền API Key qua header X-Api-Key (xử lý ở tầng gọi API)
externalAxiosClient.interceptors.request.use(
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

// ── Response Interceptor ───────────────────────────────────────────────────────
externalAxiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      // Token hết hạn → redirect về login
      localStorage.removeItem(MAIN_TOKEN_KEY);
      document.cookie = "auth_token=; path=/; max-age=0";
      document.cookie = "user_role=; path=/; max-age=0";
    }
    return Promise.reject(error);
  }
);

export default externalAxiosClient;
