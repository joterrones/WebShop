export declare function listProducts(query: unknown): Promise<{
    data: {
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
    }[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}>;
export declare function getProductById(id: string): Promise<{
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
}>;
export declare function createProduct(data: unknown): Promise<{
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
}>;
export declare function updateProduct(id: string, data: unknown): Promise<{
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
}>;
export declare function deleteProduct(id: string): Promise<{
    message: string;
    id: string;
}>;
export declare function getProductsByCategorySlug(slug: string, query: unknown): Promise<{
    data: {
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
    }[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}>;
//# sourceMappingURL=product.service.d.ts.map