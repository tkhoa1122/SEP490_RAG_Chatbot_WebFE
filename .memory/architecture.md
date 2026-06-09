# 🏗️ Clean Architecture — Smart Shopping Chatbot

## Tổng quan 4 tầng

```
src/
├── domain/               # 🎯 Tầng 1: Business Logic thuần túy
├── application/          # ⚙️  Tầng 2: Use Cases + State Management
├── infrastructure/       # 🔌 Tầng 3: API calls + Repository implementations
├── config/               # ⚙️  Tầng 4: HTTP client, app constants
└── presentation/         # 🖼️ Tầng 5: UI (components + app router pages)
    └── (app/ được quản lý bởi Next.js App Router)
```

---

## 🎯 Domain Layer (`src/domain/`)

**Nguyên tắc**: KHÔNG import bất kỳ thứ gì ngoài TypeScript types.

```
domain/
├── entities/           # Business objects thuần túy
│   ├── Chat.ts         # ChatMessage, ChatSession, SendMessagePayload
│   ├── Product.ts      # Product, ProductSearchResult
│   └── User.ts         # User, Tenant, TenantConfig, UserRole
├── dto/
│   └── api/
│       └── ApiResponse.ts  # ApiResponse<T>, PaginatedResponse<T>, ApiError
└── repositories/       # Interfaces (contracts) — NO implementations
    ├── ChatRepository.ts
    ├── ProductRepository.ts
    └── TenantRepository.ts
```

**Quy tắc entity**: Interface bắt đầu bằng chữ hoa, file đặt theo tên entity (e.g., `Chat.ts`).

---

## ⚙️ Application Layer (`src/application/`)

**Nguyên tắc**: Điều phối use cases, quản lý state. Chỉ import từ `domain/`.

```
application/
├── usecases/
│   ├── chat/
│   │   ├── SendMessageUseCase.ts
│   │   └── CreateChatSessionUseCase.ts
│   ├── product/
│   │   └── GetProductListUseCase.ts
│   ├── tenant/
│   └── auth/
├── slices/             # Zustand stores (thay Redux slices)
│   ├── chatSlice.ts
│   ├── userSlice.ts
│   └── tenantSlice.ts
├── hooks/              # Custom hooks — wiring usecases + slices
│   ├── useChat.ts
│   ├── useAuth.ts
│   ├── useTenant.ts
│   └── useDebounce.ts
└── services/           # (Nếu cần business services phức tạp hơn usecases)
```

**Dependency Injection**: UseCase nhận repository interface qua constructor:
```ts
const sendMsg = new SendMessageUseCase(chatRepositoryImpl); // inject từ infrastructure
```

---

## 🔌 Infrastructure Layer (`src/infrastructure/`)

**Nguyên tắc**: Implement domain interfaces. Đây là nơi DUY NHẤT gọi HTTP.

```
infrastructure/
├── api/                # HTTP calls — try/catch ở đây
│   ├── chatAPI.ts
│   └── productAPI.ts
├── repositories/       # Implement domain interfaces
│   ├── ChatRepositoryImpl.ts
│   └── ProductRepositoryImpl.ts
└── socket/             # WebSocket (nếu cần real-time chat)
```

**Pattern**: `*API.ts` → raw HTTP → `*RepositoryImpl.ts` → implements `domain/repositories/*Repository.ts`

---

## ⚙️ Config Layer (`src/config/`)

```
config/
├── axiosInstance.ts    # Singleton Axios với auth + tenant interceptors
└── appConfig.ts        # APP_CONFIG, ROUTES constants
```

---

## 🖼️ Presentation Layer (`src/presentation/` + `src/app/`)

```
app/
├── layout.tsx              # Root layout — Fonts, Toaster
├── page.tsx                # Redirect to /login
├── not-found.tsx           # 404 — tenant không tồn tại
├── 403/page.tsx            # 403 — không có quyền
│
├── (auth)/                 # Phân hệ Xác thực — Public (chưa đăng nhập)
│   ├── layout.tsx          # Centered card layout, không sidebar
│   ├── login/page.tsx
│   ├── register/page.tsx
│   └── forgot-password/page.tsx
│
├── (chat)/                 # Phân hệ Chat — Public per Tenant
│   └── [tenant_id]/
│       ├── layout.tsx      # GUARD: CheckTenantUseCase → 404 nếu invalid
│       └── page.tsx        # Chat widget
│
└── (dashboard)/
    ├── layout.tsx           # GUARD: token check → /login nếu không có
    │
    ├── business/            # BUSINESS_OWNER + CATALOG_MARKETING
    │   ├── page.tsx         # Overview
    │   ├── products/page.tsx
    │   ├── catalog/page.tsx
    │   ├── analytics/page.tsx
    │   ├── billing/page.tsx # GUARD: billing:read → chỉ BUSINESS_OWNER
    │   └── settings/page.tsx
    │
    └── admin/               # SYSTEM_ADMIN only
        ├── layout.tsx       # GUARD: role === SYSTEM_ADMIN → /403 nếu không phải
        ├── page.tsx
        ├── tenants/page.tsx
        ├── users/page.tsx
        ├── plans/page.tsx
        └── analytics/page.tsx

middleware.ts               # GUARD Layer 1 — Edge runtime, check mọi request
```

### 3 lớp Guard:
1. **middleware.ts** (Edge) → Check token + role từ cookie → redirect 401/403
2. **layout.tsx** (Server Component) → Verify lại từ server + inject CheckPermissionUseCase
3. **page.tsx nhạy cảm** (billing) → Guard Layer 3 với CheckPermissionUseCase


---

## 📐 Dependency Rule (quan trọng nhất!)

```
Presentation → Application → Domain ← Infrastructure
```

- `domain` không import từ ai
- `application` chỉ import từ `domain`
- `infrastructure` implement `domain` interfaces
- `presentation` import từ `application` (hooks/slices) và `presentation/components`
- `config` chỉ được import bởi `infrastructure`
