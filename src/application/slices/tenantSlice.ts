// Application State Slice: Tenant (Zustand)

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { TenantConfig } from "@/domain/entities/User";

interface TenantState {
  tenantConfig: TenantConfig | null;
  isLoading: boolean;
}

interface TenantActions {
  setTenantConfig: (config: TenantConfig) => void;
  setLoading: (loading: boolean) => void;
  clearTenant: () => void;
}

type TenantStore = TenantState & TenantActions;

export const useTenantSlice = create<TenantStore>()(
  devtools(
    (set) => ({
      tenantConfig: null,
      isLoading: false,
      setTenantConfig: (tenantConfig) => set({ tenantConfig }),
      setLoading: (isLoading) => set({ isLoading }),
      clearTenant: () => set({ tenantConfig: null }),
    }),
    { name: "TenantSlice" }
  )
);
