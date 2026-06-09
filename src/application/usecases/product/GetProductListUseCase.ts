// UseCase: GetProductList

import type { ProductRepository } from "@/domain/repositories/ProductRepository";
import type { Product } from "@/domain/entities/Product";
import type { PaginatedResponse } from "@/domain/dto/api/ApiResponse";

export class GetProductListUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(tenantId: string, page = 1, pageSize = 20): Promise<PaginatedResponse<Product>> {
    return this.productRepository.getProducts(tenantId, page, pageSize);
  }
}
