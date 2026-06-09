# 📦 Tech Stack — Smart Shopping Chatbot

## Framework & Runtime
| Công nghệ | Version | Ghi chú |
|---|---|---|
| Next.js | 16.2.7 | App Router, RSC, Turbopack |
| React | 19.2.4 | Server & Client Components |
| TypeScript | ^5 | Strict mode |
| Node.js | ≥18 | — |

## Styling
| Công nghệ | Version | Ghi chú |
|---|---|---|
| Tailwind CSS | ^4 | Config qua CSS variables |
| shadcn/ui | 4.10.0 | Style: base-nova |
| tw-animate-css | ^1.4.0 | Animation utilities |
| framer-motion | ^12.40.0 | Complex animations |

## State Management
| Thư viện | Version | Dùng cho |
|---|---|---|
| Zustand | ^5.0.14 | Global state (slices pattern) |
| @tanstack/react-query | ^5.101.0 | Server state, caching |

## HTTP & API
| Thư viện | Ghi chú |
|---|---|
| axios | Singleton instance tại `src/config/axiosInstance.ts` |

## UI Components
| Thư viện | Ghi chú |
|---|---|
| lucide-react | ^1.17.0 — Icon library |
| sonner | ^2.0.7 — Toast notifications (thay thế toast deprecated) |
| @base-ui/react | ^1.5.0 — Headless UI primitives |

## Chat / Content
| Thư viện | Ghi chú |
|---|---|
| react-markdown | ^10.1.0 — Render AI markdown responses |
| remark-gfm | ^4.0.1 — GitHub Flavored Markdown |

## Dev Tools (đã gỡ)
| Thư viện | Lý do gỡ |
|---|---|
| eslint | Gây conflict/error khó chịu — đã gỡ 2026-06-03 |
| eslint-config-next | Gỡ cùng eslint |

## Scripts (package.json)
```json
"dev": "next dev"           // Turbopack dev server → localhost:3000
"build": "next build"       // Production build
"start": "next start"       // Run production
"typecheck": "tsc --noEmit" // Thay thế lint — kiểm tra TypeScript
```

## Environment Variables
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000   # Backend API (FastAPI/Express)
NEXT_PUBLIC_RAG_API_URL=http://localhost:8001    # RAG Chatbot API
```
