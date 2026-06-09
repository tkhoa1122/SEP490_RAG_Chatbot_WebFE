import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { User } from "@/types/user";

interface UserStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;

  setUser: (user: User, token: string) => void;
  logout: () => void;
}

export const useUserStore = create<UserStore>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        token: null,
        isAuthenticated: false,

        setUser: (user, token) =>
          set({ user, token, isAuthenticated: true }),
        logout: () =>
          set({ user: null, token: null, isAuthenticated: false }),
      }),
      { name: "user-storage" }
    ),
    { name: "UserStore" }
  )
);
