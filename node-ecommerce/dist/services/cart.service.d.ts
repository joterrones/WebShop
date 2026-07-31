export declare const AVAILABLE_TALLAS: readonly ["8", "10", "12", "XS", "S", "M", "L", "XL"];
export declare function getCart(sessionToken: string): Promise<{
    id: string;
    sessionToken: string;
    items: {
        id: string;
        productId: string;
        talla: string;
        quantity: number;
        product: {
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
        lineTotal: number;
    }[];
    count: number;
    total: number;
} | {
    id: null;
    sessionToken: string;
    items: never[];
    count: number;
    total: number;
}>;
export declare function addCartItem(sessionToken: string, data: unknown): Promise<{
    id: string;
    sessionToken: string;
    items: {
        id: string;
        productId: string;
        talla: string;
        quantity: number;
        product: {
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
        lineTotal: number;
    }[];
    count: number;
    total: number;
} | {
    id: null;
    sessionToken: string;
    items: never[];
    count: number;
    total: number;
}>;
export declare function updateCartItem(sessionToken: string, itemId: string, data: unknown): Promise<{
    id: string;
    sessionToken: string;
    items: {
        id: string;
        productId: string;
        talla: string;
        quantity: number;
        product: {
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
        lineTotal: number;
    }[];
    count: number;
    total: number;
} | {
    id: null;
    sessionToken: string;
    items: never[];
    count: number;
    total: number;
}>;
export declare function removeCartItem(sessionToken: string, itemId: string): Promise<{
    id: string;
    sessionToken: string;
    items: {
        id: string;
        productId: string;
        talla: string;
        quantity: number;
        product: {
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
        lineTotal: number;
    }[];
    count: number;
    total: number;
} | {
    id: null;
    sessionToken: string;
    items: never[];
    count: number;
    total: number;
}>;
export declare function clearCart(sessionToken: string): Promise<{
    id: string;
    sessionToken: string;
    items: {
        id: string;
        productId: string;
        talla: string;
        quantity: number;
        product: {
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
        lineTotal: number;
    }[];
    count: number;
    total: number;
} | {
    id: null;
    sessionToken: string;
    items: never[];
    count: number;
    total: number;
}>;
//# sourceMappingURL=cart.service.d.ts.map