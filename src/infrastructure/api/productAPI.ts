import { axiosClient } from "@/infrastructure/api/axiosClient";
import type { ApiResponse, PaginatedResponse } from "@/domain/dto/api/ApiResponse";
import type { ProductDTO, ProductSearchResultDTO } from "@/infrastructure/dto/ProductDTO";

export const productAPI = {
  getProducts: async (tenantId: string, page = 1, pageSize = 20): Promise<PaginatedResponse<ProductDTO>> => {
    const { data } = await axiosClient.get<PaginatedResponse<ProductDTO>>("/products", {
      params: { tenantId, page, pageSize },
    });
    return data;
  },

  getProductById: async (id: string): Promise<ApiResponse<ProductDTO>> => {
    const { data } = await axiosClient.get<ApiResponse<ProductDTO>>(`/products/${id}`);
    return data;
  },

  createProduct: async (product: Partial<ProductDTO>): Promise<ApiResponse<ProductDTO>> => {
    const { data } = await axiosClient.post<ApiResponse<ProductDTO>>("/products", product);
    return data;
  },

  updateProduct: async (id: string, product: Partial<ProductDTO>): Promise<ApiResponse<ProductDTO>> => {
    const { data } = await axiosClient.patch<ApiResponse<ProductDTO>>(`/products/${id}`, product);
    return data;
  },

  deleteProduct: async (id: string): Promise<ApiResponse<null>> => {
    const { data } = await axiosClient.delete<ApiResponse<null>>(`/products/${id}`);
    return data;
  },

  searchProducts: async (query: string, tenantId: string): Promise<ApiResponse<ProductSearchResultDTO>> => {
    const { data } = await axiosClient.get<ApiResponse<ProductSearchResultDTO>>("/products/search", {
      params: { q: query, tenantId },
    });
    return data;
  },
};
