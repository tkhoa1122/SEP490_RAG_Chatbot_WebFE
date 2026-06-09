export const CONFIG = {
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000",
  RAG_API_URL: process.env.NEXT_PUBLIC_RAG_API_URL ?? "http://localhost:8001",
  APP_NAME: "Smart Shopping Chatbot",
  DEFAULT_PAGE_SIZE: 20,
  CHAT_MAX_TOKENS: 1024,
} as const;
