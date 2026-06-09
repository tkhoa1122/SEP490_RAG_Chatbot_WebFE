import { useUserStore } from "@/application/store/userStore";
import type { UserRole } from "@/types/user";

export function useAuth() {
  const { user, token, isAuthenticated, setUser, logout } = useUserStore();

  const hasRole = (role: UserRole) => user?.role === role;
  const hasAnyRole = (roles: UserRole[]) => roles.some((r) => user?.role === r);

  return {
    user,
    token,
    isAuthenticated,
    hasRole,
    hasAnyRole,
    setUser,
    logout,
  };
}
