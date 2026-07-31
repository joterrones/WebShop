import { z } from 'zod';
export declare const createAttributeSchema: z.ZodObject<{
    categoryId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    code: z.ZodString;
    name: z.ZodString;
    dataType: z.ZodEnum<["text", "number", "select", "boolean"]>;
    isRequired: z.ZodDefault<z.ZodBoolean>;
    sortOrder: z.ZodDefault<z.ZodNumber>;
    options: z.ZodOptional<z.ZodArray<z.ZodObject<{
        value: z.ZodString;
        sortOrder: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        value: string;
        sortOrder: number;
    }, {
        value: string;
        sortOrder?: number | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    code: string;
    name: string;
    sortOrder: number;
    dataType: "number" | "boolean" | "select" | "text";
    isRequired: boolean;
    options?: {
        value: string;
        sortOrder: number;
    }[] | undefined;
    categoryId?: string | null | undefined;
}, {
    code: string;
    name: string;
    dataType: "number" | "boolean" | "select" | "text";
    options?: {
        value: string;
        sortOrder?: number | undefined;
    }[] | undefined;
    sortOrder?: number | undefined;
    categoryId?: string | null | undefined;
    isRequired?: boolean | undefined;
}>;
export declare const listAttributesSchema: z.ZodObject<{
    categoryId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    categoryId?: string | undefined;
}, {
    categoryId?: string | undefined;
}>;
//# sourceMappingURL=attribute.validator.d.ts.map