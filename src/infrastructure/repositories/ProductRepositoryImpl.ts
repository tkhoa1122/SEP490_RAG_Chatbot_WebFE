// Infrastructure: ProductRepositoryImpl
// Chịu trách nhiệm gọi API và Mapping DTO thành Entity

import type { ProductRepository } from "@/domain/repositories/ProductRepository";
import type { Product, ProductSearchResult } from "@/domain/entities/Product";
import type { ApiResponse, PaginatedResponse } from "@/domain/dto/api/ApiResponse";
import { productAPI } from "@/infrastructure/api/productAPI";
import { ProductMapper } from "@/infrastructure/mappers/ProductMapper";

class ProductRepositoryImpl implements ProductRepository {
  async getProducts(tenantId: string, page?: number, pageSize?: number): Promise<PaginatedResponse<Product>> {
    const res = await productAPI.getProducts(tenantId, page, pageSize);
    return {
      ...res,
      data: res.data ? ProductMapper.toEntityList(res.data) : [],
    };
  }

  async getProductById(id: string): Promise<ApiResponse<Product>> {
    const res = await productAPI.getProductById(id);
    return {
      ...res,
      data: res.data ? ProductMapper.toEntity(res.data) : null,
    };
  }

  async createProduct(product: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<ApiResponse<Product>> {
    // Entity -> DTO
    const dto = ProductMapper.toDTO(product);
    const res = await productAPI.createProduct(dto);
    return {
      ...res,
      data: res.data ? ProductMapper.toEntity(res.data) : null,
    };
  }

  async updateProduct(id: string, product: Partial<Product>): Promise<ApiResponse<Product>> {
    // Entity -> DTO
    const dto = ProductMapper.toDTO(product);
    const res = await productAPI.updateProduct(id, dto);
    return {
      ...res,
      data: res.data ? ProductMapper.toEntity(res.data) : null,
    };
  }

  async deleteProduct(id: string): Promise<ApiResponse<null>> {
    return productAPI.deleteProduct(id);
  }

  async searchProducts(query: string, tenantId: string): Promise<ApiResponse<ProductSearchResult>> {
    const res = await productAPI.searchProducts(query, tenantId);
    return {
      ...res,
      data: res.data ? ProductMapper.toSearchResultEntity(res.data) : null,
    };
  }
}

export const productRepositoryImpl = new ProductRepositoryImpl();
