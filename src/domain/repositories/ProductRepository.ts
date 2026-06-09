// Domain Repository Interface: Product
// Gateway between Domain and Infrastructure — pure interface, no implementation

import type { Product, ProductSearchResult } from "@/domain/entities/Product";
import type { ApiResponse, PaginatedResponse } from "@/domain/dto/api/ApiResponse";

export interface ProductRepository {
  getProducts(tenantId: string, page?: number, pageSize?: number): Promise<PaginatedResponse<Product>>;
  getProductById(id: string): Promise<ApiResponse<Product>>;
  createProduct(product: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<ApiResponse<Product>>;
  updateProduct(id: string, product: Partial<Product>): Promise<ApiResponse<Product>>;
  deleteProduct(id: string): Promise<ApiResponse<null>>;
  searchProducts(query: string, tenantId: string): Promise<ApiResponse<ProductSearchResult>>;
}
