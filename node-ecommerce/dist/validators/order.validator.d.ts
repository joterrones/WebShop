import { z } from 'zod';
export declare const createOrderSchema: z.ZodObject<{
    clientName: z.ZodString;
    phoneNumber: z.ZodString;
    province: z.ZodString;
    country: z.ZodString;
    shippingAddress: z.ZodString;
    documentType: z.ZodEnum<["DNI", "RUC"]>;
    documentNumber: z.ZodString;
    shippingCost: z.ZodDefault<z.ZodNumber>;
    notes: z.ZodOptional<z.ZodString>;
    items: z.ZodArray<z.ZodObject<{
        productId: z.ZodOptional<z.ZodString>;
        productName: z.ZodString;
        description: z.ZodString;
        talla: z.ZodString;
        tipoTela: z.ZodString;
        quantity: z.ZodNumber;
        unitPrice: z.ZodNumber;
        lineDiscount: z.ZodDefault<z.ZodNumber>;
        attributes: z.ZodOptional<z.ZodArray<z.ZodObject<{
            attributeCode: z.ZodString;
            attributeName: z.ZodString;
            value: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            value: string;
            attributeCode: string;
            attributeName: string;
        }, {
            value: string;
            attributeCode: string;
            attributeName: string;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        description: string;
        productName: string;
        talla: string;
        tipoTela: string;
        quantity: number;
        unitPrice: number;
        lineDiscount: number;
        productId?: string | undefined;
        attributes?: {
            value: string;
            attributeCode: string;
            attributeName: string;
        }[] | undefined;
    }, {
        description: string;
        productName: string;
        talla: string;
        tipoTela: string;
        quantity: number;
        unitPrice: number;
        productId?: string | undefined;
        lineDiscount?: number | undefined;
        attributes?: {
            value: string;
            attributeCode: string;
            attributeName: string;
        }[] | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    clientName: string;
    phoneNumber: string;
    province: string;
    country: string;
    shippingAddress: string;
    documentType: "DNI" | "RUC";
    documentNumber: string;
    shippingCost: number;
    items: {
        description: string;
        productName: string;
        talla: string;
        tipoTela: string;
        quantity: number;
        unitPrice: number;
        lineDiscount: number;
        productId?: string | undefined;
        attributes?: {
            value: string;
            attributeCode: string;
            attributeName: string;
        }[] | undefined;
    }[];
    notes?: string | undefined;
}, {
    clientName: string;
    phoneNumber: string;
    province: string;
    country: string;
    shippingAddress: string;
    documentType: "DNI" | "RUC";
    documentNumber: string;
    items: {
        description: string;
        productName: string;
        talla: string;
        tipoTela: string;
        quantity: number;
        unitPrice: number;
        productId?: string | undefined;
        lineDiscount?: number | undefined;
        attributes?: {
            value: string;
            attributeCode: string;
            attributeName: string;
        }[] | undefined;
    }[];
    shippingCost?: number | undefined;
    notes?: string | undefined;
}>;
export declare const listOrdersSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    status: z.ZodOptional<z.ZodEnum<["pendiente", "en_proceso", "atendido"]>>;
    documentNumber: z.ZodOptional<z.ZodString>;
    search: z.ZodOptional<z.ZodString>;
    fromDate: z.ZodOptional<z.ZodString>;
    toDate: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    status?: "pendiente" | "en_proceso" | "atendido" | undefined;
    search?: string | undefined;
    documentNumber?: string | undefined;
    fromDate?: string | undefined;
    toDate?: string | undefined;
}, {
    status?: "pendiente" | "en_proceso" | "atendido" | undefined;
    search?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    documentNumber?: string | undefined;
    fromDate?: string | undefined;
    toDate?: string | undefined;
}>;
export declare const updateOrderStatusSchema: z.ZodObject<{
    toStatus: z.ZodEnum<["pendiente", "en_proceso", "atendido"]>;
    reason: z.ZodOptional<z.ZodString>;
    changedBy: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    toStatus: "pendiente" | "en_proceso" | "atendido";
    reason?: string | undefined;
    changedBy?: string | undefined;
}, {
    toStatus: "pendiente" | "en_proceso" | "atendido";
    reason?: string | undefined;
    changedBy?: string | undefined;
}>;
export declare const createAdjustmentSchema: z.ZodObject<{
    orderItemId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    adjustmentType: z.ZodEnum<["discount_percent", "discount_fixed", "price_override"]>;
    value: z.ZodNumber;
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    value: number;
    reason: string;
    adjustmentType: "discount_percent" | "discount_fixed" | "price_override";
    orderItemId?: string | null | undefined;
}, {
    value: number;
    reason: string;
    adjustmentType: "discount_percent" | "discount_fixed" | "price_override";
    orderItemId?: string | null | undefined;
}>;
//# sourceMappingURL=order.validator.d.ts.map