import { toNumber } from '../utils/decimal';
import { toPublicUrl } from '../utils/media';

export interface ProductAttributeValueRow {
  valueText: string | null;
  attributeDefinition: { code: string };
  attributeOption: { value: string } | null;
}

export interface ProductImageRow {
  url: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface ProductRow {
  id: string;
  name: string;
  description: string;
  slug: string;
  categoryId: string;
  basePrice: { toString(): string } | number;
  previousPrice: { toString(): string } | number | null;
  stockQuantity: number;
  isActive: boolean;
  showInBanner: boolean;
  reviews: number;
  ratingRate: { toString(): string } | number;
  category: { slug: string; name: string };
  images: ProductImageRow[];
  attributeValues: ProductAttributeValueRow[];
}

export function mapProductToResponse(product: ProductRow) {
  const primaryImage =
    product.images.find((img) => img.isPrimary) ?? product.images[0];

  const attributes: Record<string, string> = {};
  for (const av of product.attributeValues) {
    const code = av.attributeDefinition.code;
    attributes[code] =
      av.attributeOption?.value ?? av.valueText ?? '';
  }

  return {
    id: product.id,
    name: product.name,
    description: product.description,
    urlImg: toPublicUrl(primaryImage?.url ?? ''),
    images: [...product.images]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((img) => toPublicUrl(img.url)),
    imagePaths: [...product.images]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((img) => img.url),
    category: product.category.slug,
    categoryId: product.categoryId,
    categoryName: product.category.name,
    price: toNumber(product.basePrice),
    previousPrice: product.previousPrice
      ? toNumber(product.previousPrice)
      : null,
    inStock: product.stockQuantity > 0 && product.isActive,
    stockQuantity: product.stockQuantity,
    isActive: product.isActive,
    showInBanner: product.showInBanner,
    reviews: product.reviews,
    ratingRate: toNumber(product.ratingRate),
    attributes,
    slug: product.slug,
  };
}
