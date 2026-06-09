import { useTenantStore } from "@/application/store/tenantStore";

export function useTenant() {
  const { tenantId, tenantName, primaryColor, logoUrl, setTenantInfo, clearTenant } = useTenantStore();

  return {
    tenantConfig: {
      tenantId,
      brandName: tenantName,
      primaryColor,
      logoUrl,
    },
    isLoading: false, // You can add isLoading to store if needed
    tenantId,
    brandName: tenantName,
    primaryColor,
    setTenantConfig: (config: any) => setTenantInfo(config.tenantId, config.primaryColor, config.logoUrl, config.brandName),
    clearTenant,
  };
}
