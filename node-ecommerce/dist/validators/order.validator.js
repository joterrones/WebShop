"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAdjustmentSchema = exports.updateOrderStatusSchema = exports.listOrdersSchema = exports.createOrderSchema = void 0;
const zod_1 = require("zod");
const orderItemAttributeSchema = zod_1.z.object({
    attributeCode: zod_1.z.string(),
    attributeName: zod_1.z.string(),
    value: zod_1.z.string(),
});
const orderItemSchema = zod_1.z.object({
    productId: zod_1.z.string().uuid().optional(),
    productName: zod_1.z.string().min(1),
    description: zod_1.z.string(),
    talla: zod_1.z.string().min(1),
    tipoTela: zod_1.z.string().min(1),
    quantity: zod_1.z.number().int().positive(),
    unitPrice: zod_1.z.number().positive(),
    lineDiscount: zod_1.z.number().min(0).default(0),
    attributes: zod_1.z.array(orderItemAttributeSchema).optional(),
});
exports.createOrderSchema = zod_1.z.object({
    clientName: zod_1.z.string().min(1),
    phoneNumber: zod_1.z.string().min(1),
    province: zod_1.z.string().min(1),
    country: zod_1.z.string().min(1),
    shippingAddress: zod_1.z.string().min(1),
    documentType: zod_1.z.enum(['DNI', 'RUC']),
    documentNumber: zod_1.z.string().min(1),
    shippingCost: zod_1.z.number().min(0).default(0),
    notes: zod_1.z.string().optional(),
    items: zod_1.z.array(orderItemSchema).min(1),
});
exports.listOrdersSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
    status: zod_1.z.enum(['pendiente', 'en_proceso', 'atendido']).optional(),
    documentNumber: zod_1.z.string().optional(),
    search: zod_1.z.string().optional(),
    fromDate: zod_1.z.string().datetime().optional(),
    toDate: zod_1.z.string().datetime().optional(),
});
exports.updateOrderStatusSchema = zod_1.z.object({
    toStatus: zod_1.z.enum(['pendiente', 'en_proceso', 'atendido']),
    reason: zod_1.z.string().optional(),
    changedBy: zod_1.z.string().optional(),
});
exports.createAdjustmentSchema = zod_1.z.object({
    orderItemId: zod_1.z.string().uuid().optional().nullable(),
    adjustmentType: zod_1.z.enum([
        'discount_percent',
        'discount_fixed',
        'price_override',
    ]),
    value: zod_1.z.number().positive(),
    reason: zod_1.z.string().min(1),
});
//# sourceMappingURL=order.validator.js.map