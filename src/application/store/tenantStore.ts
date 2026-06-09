import { create } from 'zustand';

// Định nghĩa kiểu dữ liệu cho Store
interface TenantState {
  tenantId: string | null;
  primaryColor: string;
  logoUrl: string;
  tenantName: string;

  // Các Action (Hàm để cập nhật State)
  setTenantInfo: (id: string, color: string, logo: string, name: string) => void;
  clearTenant: () => void;
}

// Khởi tạo Store
export const useTenantStore = create<TenantState>((set) => ({
  // Giá trị mặc định
  tenantId: null,
  primaryColor: '#000000', // Đen mặc định
  logoUrl: '',
  tenantName: 'Smart Store',

  // Hàm cập nhật
  setTenantInfo: (id, color, logo, name) =>
    set({ tenantId: id, primaryColor: color, logoUrl: logo, tenantName: name }),

  clearTenant: () =>
    set({ tenantId: null, primaryColor: '#000000', logoUrl: '', tenantName: 'Smart Store' }),
}));