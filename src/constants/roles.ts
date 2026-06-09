import type { UserRole } from "@/types/user";

export const USER_ROLES: Record<UserRole, string> = {
  customer: "Customer",
  business_owner: "Business Owner",
  marketing: "Marketing Team",
  admin: "System Admin",
};

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  customer: ["chat:read", "chat:write"],
  business_owner: ["dashboard:read", "products:write", "analytics:read"],
  marketing: ["products:write", "catalog:write", "analytics:read"],
  admin: ["*"], // full access
};
