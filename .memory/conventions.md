# 📋 Coding Conventions — Smart Shopping Chatbot

## Naming Conventions

### Files & Folders
| Loại | Convention | Ví dụ |
|---|---|---|
| Domain Entity | PascalCase | `Chat.ts`, `Product.ts` |
| Repository Interface | PascalCase + Repository | `ChatRepository.ts` |
| Repository Impl | PascalCase + RepositoryImpl | `ChatRepositoryImpl.ts` |
| UseCase | PascalCase + UseCase | `SendMessageUseCase.ts` |
| Zustand Slice | camelCase + Slice | `chatSlice.ts` |
| API file | camelCase + API | `chatAPI.ts` |
| Hook | camelCase + use prefix | `useChat.ts` |
| React Component | PascalCase | `MessageBubble.tsx` |
| Config | camelCase | `axiosInstance.ts` |

### TypeScript Interfaces
- Domain entities: `interface Product {}` (no I prefix)
- Props: `interface MessageBubbleProps {}` (component name + Props)
- Store state: `interface ChatState {}`, `interface ChatActions {}`

## Import Aliases (tsconfig paths)
```ts
@/domain/*         → src/domain/*
@/application/*    → src/application/*
@/infrastructure/* → src/infrastructure/*
@/config/*         → src/config/*
@/presentation/*   → src/presentation/*
@/lib/*            → src/lib/*
```

## Component Conventions
- **Server Components** by default trong `app/`
- Add `"use client"` chỉ khi cần: state, effects, event handlers
- Props destructuring tại function signature
- Export default cho page components, named export cho reusable components

## Clean Architecture Rules
1. **Domain**: KHÔNG import bất kỳ thứ gì từ ngoài `domain/`
2. **Application**: Chỉ import từ `domain/`
3. **Infrastructure**: Implement `domain/repositories/*` — là nơi DUY NHẤT gọi HTTP
4. **Presentation**: Import từ `application/hooks` và `presentation/components`
5. Không viết `fetch()` hay `axios` trực tiếp trong components

## State Management Pattern
```ts
// ✅ Đúng: dùng hook từ application layer
import { useChat } from "@/application/hooks/useChat";

// ❌ Sai: import store trực tiếp trong component
import { useChatSlice } from "@/application/slices/chatSlice";
```

## API Error Handling
- `try/catch` CHỈ ở `infrastructure/api/*.ts`
- UseCase validate business rules (empty input, v.v.)
- Hook xử lý UI state (setError, setLoading)
- Component hiển thị error state

## Zustand Slice Pattern
```ts
// Tách State và Actions thành interfaces riêng
interface FooState { ... }
interface FooActions { ... }
type FooStore = FooState & FooActions;
```

## Multi-tenant Pattern
- `tenant_id` lấy từ URL params (`/[tenant_id]/page.tsx`)
- Mọi API request tự động đính kèm `X-Tenant-ID` header qua `axiosInstance` interceptor
- Tenant config lưu trong `useTenantSlice`

## Tailwind CSS Rules (v3 & v4 Best Practices)
1. **Tránh dùng Arbitrary Spacing bằng ngoặc vuông (`[]`) nếu có thể:**
   - Khi cần dùng px, v4 hỗ trợ viết trực tiếp KHÔNG cần ngoặc vuông.
   - **Đúng**: `w-5`, `h-34.5`, `w-288.75`, `text-11px`, `text-10px`, `min-w-5`
   - **Sai**: `w-[20px]`, `h-[138px]`, `w-[72.1875rem]`, `text-[11px]`, `text-[10px]`, `min-w-[20px]`
2. **Gradient Utilities Mới:**
   - Từ v4, `bg-gradient-to-*` được chuyển thành `bg-linear-to-*`.
   - **Đúng**: `bg-linear-to-t`, `bg-linear-to-tr`
   - **Sai**: `bg-gradient-to-t`, `bg-gradient-to-tr`
3. **Các Class Rút Gọn (Deprecated Utilities):**
   - Không sử dụng `flex-shrink` hay `flex-grow` (bị deprecated).
   - **Đúng**: `shrink-0`, `shrink`, `grow-0`, `grow`
   - **Sai**: `flex-shrink-0`, `flex-shrink`, `flex-grow-0`, `flex-grow`
4. **Aspect Ratio:**
   - Tránh dùng ngoặc vuông cho aspect ratio tuỳ chỉnh nếu nó chia được.
   - **Đúng**: `aspect-1155/678`, `aspect-3/4`
   - **Sai**: `aspect-[1155/678]`, `aspect-[3/4]`
