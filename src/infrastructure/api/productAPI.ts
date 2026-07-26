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
import type { ProductCreateCommand, ProductDTO, ProductSearchResultDTO } from "@/infrastructure/dto/ProductDTO";
import type { ApiResponse, PaginatedResponse } from "@/domain/dto/api/ApiResponse";

export const productAPI = {
  /**
   * Tạo sản phẩm mới
   * POST /api/v1/products (Internal API)
   */
  createProduct: async (product: ProductCreateCommand): Promise<ApiResponse<ProductDTO>> => {
    const { data } = await mainAxiosClient.post<ApiResponse<ProductDTO>>("/products", product);
    return data;
  },

  /**
   * Lấy danh sách sản phẩm (phân trang)
   * GET /api/v1/products (Internal API)
   */
  getProducts: async (tenantId: string, page = 1, pageSize = 20): Promise<PaginatedResponse<ProductDTO>> => {
    const { data } = await mainAxiosClient.get<PaginatedResponse<ProductDTO>>("/products", {
      params: { PageIndex: page, PageSize: pageSize },
    });
    return data;
  },

  /**
   * Lấy sản phẩm theo ID
   * GET /api/v1/products/:id (Internal API)
   */
  getProductById: async (id: string): Promise<ApiResponse<ProductDTO>> => {
    const { data } = await mainAxiosClient.get<ApiResponse<ProductDTO>>(`/products/${id}`);
    return data;
  },

  /**
   * Cập nhật sản phẩm
   * PUT /api/v1/products/:id (Internal API)
   */
  updateProduct: async (id: string, product: Partial<ProductCreateCommand>): Promise<ApiResponse<ProductDTO>> => {
    const { data } = await mainAxiosClient.put<ApiResponse<ProductDTO>>(`/products/${id}`, product);
    return data;
  },

  /**
   * Xóa sản phẩm
   * DELETE /api/v1/products/:id (Internal API)
   */
  deleteProduct: async (id: string): Promise<ApiResponse<null>> => {
    const { data } = await mainAxiosClient.delete<ApiResponse<null>>(`/products/${id}`);
    return data;
  },

  /**
   * Tìm kiếm sản phẩm
   * GET /api/v1/products (Internal API)
   */
  searchProducts: async (query: string, tenantId: string): Promise<ApiResponse<ProductSearchResultDTO>> => {
    const { data } = await mainAxiosClient.get<ApiResponse<ProductSearchResultDTO>>("/products", {
      params: { Name: query },
    });
    return data;
  },

  /**
   * Import sản phẩm từ file Excel/CSV
   * POST /api/v1/products/import (Internal API)
   */
  importProducts: async (file: File): Promise<ApiResponse<any>> => {
    const formData = new FormData();
    formData.append("File", file);
    formData.append("file", file);
    const { data } = await mainAxiosClient.post<ApiResponse<any>>("/products/import", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  },
};
