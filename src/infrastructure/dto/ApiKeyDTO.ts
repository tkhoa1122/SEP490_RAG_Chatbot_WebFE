/**
 * 🔑 API Key DTO — Quản lý Secret Key
 *
 * Dùng cho: apiKeyAPI.ts (UC-010)
 * Không chứa logic, chỉ chứa cấu trúc dữ liệu.
 */

export interface ApiKeyDto {
  id: string;
  name: string;
  keyPrefix?: string;   // Ví dụ: sk_live_****
  keyMasked?: string;   // Mã key bị che
  createdAt: string;
  expiresAt?: string | null;
  lastUsedAt?: string | null;
  isActive: boolean;
}

export interface ApiKeyDetailDto extends ApiKeyDto {
  keyValue: string;     // Mã key gốc chưa bị che, chỉ trả về khi gọi API lấy chi tiết hoặc lúc vừa tạo
}

export interface CreateApiKeyRequest {
  name: string;
}
