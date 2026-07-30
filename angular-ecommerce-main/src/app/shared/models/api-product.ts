import { ProductAttributes } from './product';

export interface ApiProductResponse {
  id: string;
  name: string;
  description: string;
  urlImg: string;
  images: string[];
  imagePaths?: string[];
  category: string;
  categoryId?: string;
  categoryName?: string;
  price: number;
  previousPrice: number | null;
  inStock: boolean;
  stockQuantity?: number;
  isActive?: boolean;
  attributes: ProductAttributes;
  slug?: string;
}

export interface ApiProductsListResponse {
  data: ApiProductResponse[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
