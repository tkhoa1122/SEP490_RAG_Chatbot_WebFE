// Application State Slice: User (Zustand with persistence)

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { User } from "@/domain/entities/User";

interface UserState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

interface UserActions {
  setUser: (user: User, token: string) => void;
  logout: () => void;
}

type UserStore = UserState & UserActions;

export const useUserSlice = create<UserStore>()(
  devtools(
    persist(
      (set) => ({
        // State
        user: null,
        token: null,
        isAuthenticated: false,

        // Actions
        setUser: (user, token) =>
          set({ user, token, isAuthenticated: true }),
        logout: () =>
          set({ user: null, token: null, isAuthenticated: false }),
      }),
      { name: "user-storage" }
    ),
    { name: "UserSlice" }
  )
);
