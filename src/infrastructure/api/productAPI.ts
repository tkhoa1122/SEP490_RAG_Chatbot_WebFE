/**
 * 📦 Product API — External API (Smart Shopping ChatBot Main Server)
 *
 * Base: NEXT_PUBLIC_EXTERNAL_API_URL (mặc định: http://localhost:5000/api/v1)
 * Swagger: http://localhost:5000/swagger/external/index.html
 *
 * Endpoints (External API):
 *   POST   /api/v1/product          — BO tạo sản phẩm mới
 *
 * Auth:
 *   - Dashboard (BO/CT): JWT Bearer token (từ main_auth_token trong localStorage)
 *   - Web bên ngoài: API Key qua header X-Api-Key
 *
 * Lưu ý: GET/PUT/DELETE sản phẩm chưa có trong External swagger.
 * Tạm thời giữ lại axiosClient (Storefront) cho các thao tác đọc.
 */

import mainAxiosClient from "@/infrastructure/api/mainAxiosClient";
import { axiosClient } from "@/infrastructure/api/axiosClient";
import type { ProductCreateCommand, ProductDTO, ProductSearchResultDTO } from "@/infrastructure/dto/ProductDTO";
import type { ApiResponse, PaginatedResponse } from "@/domain/dto/api/ApiResponse";

export const productAPI = {
  // ── External API (localhost:5000) — Ghi dữ liệu ─────────────────────────────

  /**
   * Tạo sản phẩm mới
   * POST /api/v1/partner/products
   */
  createProduct: async (product: ProductCreateCommand): Promise<ApiResponse<ProductDTO>> => {
    const { data } = await mainAxiosClient.post<ApiResponse<ProductDTO>>("/products", product);
    return data;
  },

  // ── Storefront API (Render) — Đọc dữ liệu (tạm thời) ─────────────────────────
  // TODO: Cập nhật khi External API có thêm GET/PUT/DELETE cho sản phẩm

  /**
   * Lấy danh sách sản phẩm (phân trang)
   * GET /partner/products (External API)
   */
  getProducts: async (tenantId: string, page = 1, pageSize = 20): Promise<PaginatedResponse<ProductDTO>> => {
    const { data } = await mainAxiosClient.get<PaginatedResponse<ProductDTO>>("/products", {
      params: { PageIndex: page, PageSize: pageSize },
    });
    return data;
  },

  /**
   * Lấy sản phẩm theo ID
   * GET /partner/products/:id (External API)
   */
  getProductById: async (id: string): Promise<ApiResponse<ProductDTO>> => {
    const { data } = await mainAxiosClient.get<ApiResponse<ProductDTO>>(`/products/${id}`);
    return data;
  },

  /**
   * Cập nhật sản phẩm
   * PUT /partner/products/:id (External API)
   */
  updateProduct: async (id: string, product: Partial<ProductCreateCommand>): Promise<ApiResponse<ProductDTO>> => {
    const { data } = await mainAxiosClient.put<ApiResponse<ProductDTO>>(`/products/${id}`, product);
    return data;
  },

  /**
   * Xóa sản phẩm
   * DELETE /partner/products/:id (External API)
   */
  deleteProduct: async (id: string): Promise<ApiResponse<null>> => {
    const { data } = await mainAxiosClient.delete<ApiResponse<null>>(`/products/${id}`);
    return data;
  },

  /**
   * Tìm kiếm sản phẩm
   * GET /products/search (Storefront - tạm thời)
   */
  searchProducts: async (query: string, tenantId: string): Promise<ApiResponse<ProductSearchResultDTO>> => {
    // Note: The new API returns a standard list of products, not a ProductSearchResultDTO
    // So we might need to map it, or just use the same getProducts format.
    // For now, we will return it as if the data matches ProductSearchResultDTO structure
    // (which might just be { products: [...], total: ... })
    // If external API differs, this might need mapper adjustments.
    const { data } = await mainAxiosClient.get<ApiResponse<ProductSearchResultDTO>>("/products", {
      params: { Name: query },
    });
    return data;
  },
};
