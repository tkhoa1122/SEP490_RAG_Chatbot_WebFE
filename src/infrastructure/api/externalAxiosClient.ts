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
import { MAIN_USER_KEY } from "./mainAxiosClient";

// ── Base URL ───────────────────────────────────────────────────────────────────
// Sử dụng Proxy của Next.js để gọi API mà không bị lỗi CORS
export const EXTERNAL_API_BASE_URL = "/api/v1";

// ── Axios Instance ─────────────────────────────────────────────────────────────
const externalAxiosClient: AxiosInstance = axios.create({
  baseURL: EXTERNAL_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 20000, // 20 giây — upload sản phẩm có thể lâu hơn
});

// ── Request Interceptor: gắn JWT token từ Cookie ─────────────────────────────
// BO truy cập từ Dashboard → dùng JWT token như Internal API
// Web bên ngoài → truyền API Key qua header X-Api-Key (xử lý ở tầng gọi API)
externalAxiosClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
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

// ── Response Interceptor ───────────────────────────────────────────────────────
externalAxiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      // Token hết hạn → xóa cookie và redirect về login
      localStorage.removeItem(MAIN_USER_KEY);
      document.cookie = "auth_token=; path=/; max-age=0";
      document.cookie = "user_role=; path=/; max-age=0";
      document.cookie = "tenant_id=; path=/; max-age=0";
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default externalAxiosClient;
