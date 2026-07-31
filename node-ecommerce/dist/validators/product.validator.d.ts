import { z } from 'zod';
export declare const createProductSchema: z.ZodObject<{
    categoryId: z.ZodString;
    name: z.ZodString;
    slug: z.ZodString;
    description: z.ZodString;
    basePrice: z.ZodNumber;
    previousPrice: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    stockQuantity: z.ZodDefault<z.ZodNumber>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    images: z.ZodOptional<z.ZodArray<z.ZodObject<{
        /** URL absoluta o ruta relativa pública, ej. /images/products/foto.svg */
        url: z.ZodString;
        altText: z.ZodOptional<z.ZodString>;
        sortOrder: z.ZodDefault<z.ZodNumber>;
        isPrimary: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        sortOrder: number;
        url: string;
        isPrimary: boolean;
        altText?: string | undefined;
    }, {
        url: string;
        sortOrder?: number | undefined;
        altText?: string | undefined;
        isPrimary?: boolean | undefined;
    }>, "many">>;
    attributeValues: z.ZodOptional<z.ZodArray<z.ZodObject<{
        attributeDefinitionId: z.ZodString;
        valueText: z.ZodOptional<z.ZodString>;
        attributeOptionId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        attributeDefinitionId: string;
        valueText?: string | undefined;
        attributeOptionId?: string | undefined;
    }, {
        attributeDefinitionId: string;
        valueText?: string | undefined;
        attributeOptionId?: string | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    name: string;
    slug: string;
    isActive: boolean;
    categoryId: string;
    description: string;
    basePrice: number;
    stockQuantity: number;
    previousPrice?: number | null | undefined;
    images?: {
        sortOrder: number;
        url: string;
        isPrimary: boolean;
        altText?: string | undefined;
    }[] | undefined;
    attributeValues?: {
        attributeDefinitionId: string;
        valueText?: string | undefined;
        attributeOptionId?: string | undefined;
    }[] | undefined;
}, {
    name: string;
    slug: string;
    categoryId: string;
    description: string;
    basePrice: number;
    isActive?: boolean | undefined;
    previousPrice?: number | null | undefined;
    stockQuantity?: number | undefined;
    images?: {
        url: string;
        sortOrder?: number | undefined;
        altText?: string | undefined;
        isPrimary?: boolean | undefined;
    }[] | undefined;
    attributeValues?: {
        attributeDefinitionId: string;
        valueText?: string | undefined;
        attributeOptionId?: string | undefined;
    }[] | undefined;
}>;
export declare const updateProductSchema: z.ZodObject<{
    categoryId: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
    slug: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    basePrice: z.ZodOptional<z.ZodNumber>;
    previousPrice: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodNumber>>>;
    stockQuantity: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    isActive: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    images: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodObject<{
        /** URL absoluta o ruta relativa pública, ej. /images/products/foto.svg */
        url: z.ZodString;
        altText: z.ZodOptional<z.ZodString>;
        sortOrder: z.ZodDefault<z.ZodNumber>;
        isPrimary: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        sortOrder: number;
        url: string;
        isPrimary: boolean;
        altText?: string | undefined;
    }, {
        url: string;
        sortOrder?: number | undefined;
        altText?: string | undefined;
        isPrimary?: boolean | undefined;
    }>, "many">>>;
    attributeValues: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodObject<{
        attributeDefinitionId: z.ZodString;
        valueText: z.ZodOptional<z.ZodString>;
        attributeOptionId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        attributeDefinitionId: string;
        valueText?: string | undefined;
        attributeOptionId?: string | undefined;
    }, {
        attributeDefinitionId: string;
        valueText?: string | undefined;
        attributeOptionId?: string | undefined;
    }>, "many">>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    slug?: string | undefined;
    isActive?: boolean | undefined;
    categoryId?: string | undefined;
    description?: string | undefined;
    basePrice?: number | undefined;
    previousPrice?: number | null | undefined;
    stockQuantity?: number | undefined;
    images?: {
        sortOrder: number;
        url: string;
        isPrimary: boolean;
        altText?: string | undefined;
    }[] | undefined;
    attributeValues?: {
        attributeDefinitionId: string;
        valueText?: string | undefined;
        attributeOptionId?: string | undefined;
    }[] | undefined;
}, {
    name?: string | undefined;
    slug?: string | undefined;
    isActive?: boolean | undefined;
    categoryId?: string | undefined;
    description?: string | undefined;
    basePrice?: number | undefined;
    previousPrice?: number | null | undefined;
    stockQuantity?: number | undefined;
    images?: {
        url: string;
        sortOrder?: number | undefined;
        altText?: string | undefined;
        isPrimary?: boolean | undefined;
    }[] | undefined;
    attributeValues?: {
        attributeDefinitionId: string;
        valueText?: string | undefined;
        attributeOptionId?: string | undefined;
    }[] | undefined;
}>;
export declare const listProductsSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    categoryId: z.ZodOptional<z.ZodString>;
    categorySlug: z.ZodOptional<z.ZodString>;
    search: z.ZodOptional<z.ZodString>;
    /** Filtra por activo/inactivo. Si no se envía, ver includeInactive. */
    isActive: z.ZodEffects<z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodEnum<["true", "false"]>]>>, boolean | undefined, boolean | "true" | "false" | undefined>;
    /** Si es true y no hay isActive, incluye activos e inactivos (panel admin) */
    includeInactive: z.ZodEffects<z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodEnum<["true", "false"]>]>>, boolean, boolean | "true" | "false" | undefined>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    includeInactive: boolean;
    search?: string | undefined;
    isActive?: boolean | undefined;
    categoryId?: string | undefined;
    categorySlug?: string | undefined;
}, {
    search?: string | undefined;
    isActive?: boolean | "true" | "false" | undefined;
    categoryId?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    categorySlug?: string | undefined;
    includeInactive?: boolean | "true" | "false" | undefined;
}>;
//# sourceMappingURL=product.validator.d.ts.map