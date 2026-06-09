# 🔗 API Contracts — Smart Shopping Chatbot

## Base URL
```
Backend API:  NEXT_PUBLIC_API_BASE_URL (default: http://localhost:8000)
RAG API:      NEXT_PUBLIC_RAG_API_URL  (default: http://localhost:8001)
```

## Auth Headers (auto-injected by axiosInstance)
```
Authorization: Bearer <token>
X-Tenant-ID: <tenant_id>
```

## Standard Response Envelope
```ts
// Mọi API đều trả về dạng này (xem domain/dto/api/ApiResponse.ts)
interface ApiResponse<T> {
  status: "success" | "fail";
  message: string;
  data?: T | null;
  success: boolean;
  error: unknown | null;
  accessToken?: string | null;
  refreshToken?: string | null;
}
```

---

## Chat Endpoints

| Method | Path | Body / Params | Response |
|---|---|---|---|
| POST | `/chat/sessions` | `{ tenantId }` | `ApiResponse<ChatSession>` |
| POST | `/chat/sessions/:id/messages` | `{ message, tenantId }` | `ApiResponse<ChatMessage>` |
| GET  | `/chat/sessions/:id` | — | `ApiResponse<ChatSession>` |

---

## Product Endpoints

| Method | Path | Params | Response |
|---|---|---|---|
| GET | `/products` | `tenantId, page, pageSize` | `PaginatedResponse<Product>` |
| GET | `/products/:id` | — | `ApiResponse<Product>` |
| POST | `/products` | Product body | `ApiResponse<Product>` |
| PATCH | `/products/:id` | Partial Product | `ApiResponse<Product>` |
| DELETE | `/products/:id` | — | `ApiResponse<null>` |
| GET | `/products/search` | `q, tenantId` | `ApiResponse<ProductSearchResult>` |

---

## Tenant Endpoints

| Method | Path | Response |
|---|---|---|
| GET | `/tenants/slug/:slug` | `ApiResponse<TenantConfig>` |
| GET | `/tenants` | `PaginatedResponse<Tenant>` |
| POST | `/tenants` | `ApiResponse<Tenant>` |
| PATCH | `/tenants/:id` | `ApiResponse<Tenant>` |
| DELETE | `/tenants/:id` | `ApiResponse<null>` |

---

## Ghi chú
- Backend chưa chạy → dùng mock data hoặc MSW (Mock Service Worker) khi dev
- Khi backend thay đổi response shape → chỉ cần cập nhật `domain/dto/api/ApiResponse.ts`
- Endpoints này là **kế hoạch ban đầu** — cập nhật khi có Swagger/OpenAPI từ backend team
