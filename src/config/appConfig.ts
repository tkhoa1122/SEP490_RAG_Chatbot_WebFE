// Config: Application-wide constants

export const APP_CONFIG = {
  APP_NAME: "Smart Shopping Chatbot",
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000",
  RAG_API_URL: process.env.NEXT_PUBLIC_RAG_API_URL ?? "http://localhost:8001",
  DEFAULT_PAGE_SIZE: 20,
  CHAT_MAX_TOKENS: 1024,
} as const;

export const ROUTES = {
  CHAT: (tenantId: string) => `/${tenantId}`,
  DASHBOARD: {
    BUSINESS: "/business",
    ADMIN: "/admin",
  },
  AUTH: {
    LOGIN: "/login",
    REGISTER: "/register",
  },
} as const;
