export interface ProductAttributes {
  talla?: string;
  tipo_tela?: string;
  color?: string;
  marca?: string;
  [key: string]: string | undefined;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  urlImg: string;
  images?: string[];
  /** Rutas relativas guardadas en BD, ej. /images/products/x.jpg */
  imagePaths?: string[];
  reviews: number;
  ratingRate: number;
  category: string;
  categoryId?: string;
  categoryName?: string;
  price: number;
  previousPrice: number | null;
  inStock: boolean;
  stockQuantity?: number;
  isActive?: boolean;
  showInBanner?: boolean;
  attributes?: ProductAttributes;
  slug?: string;
}

export interface CategoryOption {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  children: { id: string; name: string; slug: string; sortOrder: number }[];
}

export interface ProductWriteDto {
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  previousPrice?: number | null;
  stockQuantity: number;
  isActive: boolean;
  showInBanner?: boolean;
  reviews?: number;
  ratingRate?: number;
  images?: {
    url: string;
    altText?: string;
    sortOrder: number;
    isPrimary: boolean;
  }[];
}
