export const ROUTES = {
  // Public chat routes
  CHAT: (tenantId: string) => `/${tenantId}`,

  // Dashboard routes
  DASHBOARD: {
    BUSINESS: "/business",
    ADMIN: "/admin",
  },

  // Auth routes
  AUTH: {
    LOGIN: "/login",
    REGISTER: "/register",
  },
} as const;
