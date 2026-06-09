export interface ProductDTO {
  product_id: string;
  tenant_id: string;
  p_name: string;
  p_description: string;
  p_price: number;
  p_currency: string;
  p_image_url?: string;
  p_category: string;
  p_tags: string[];
  in_stock: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductSearchResultDTO {
  products: ProductDTO[];
  total: number;
  page: number;
  page_size: number;
}
