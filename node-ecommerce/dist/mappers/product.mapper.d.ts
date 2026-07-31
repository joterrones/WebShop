export interface ProductAttributeValueRow {
    valueText: string | null;
    attributeDefinition: {
        code: string;
    };
    attributeOption: {
        value: string;
    } | null;
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
    basePrice: {
        toString(): string;
    } | number;
    previousPrice: {
        toString(): string;
    } | number | null;
    stockQuantity: number;
    isActive: boolean;
    category: {
        slug: string;
        name: string;
    };
    images: ProductImageRow[];
    attributeValues: ProductAttributeValueRow[];
}
export declare function mapProductToResponse(product: ProductRow): {
    id: string;
    name: string;
    description: string;
    urlImg: string;
    images: string[];
    imagePaths: string[];
    category: string;
    categoryId: string;
    categoryName: string;
    price: number;
    previousPrice: number | null;
    inStock: boolean;
    stockQuantity: number;
    isActive: boolean;
    attributes: Record<string, string>;
    slug: string;
};
//# sourceMappingURL=product.mapper.d.ts.map