"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listProductsSchema = exports.updateProductSchema = exports.createProductSchema = void 0;
const zod_1 = require("zod");
const attributeValueSchema = zod_1.z.object({
    attributeDefinitionId: zod_1.z.string().uuid(),
    valueText: zod_1.z.string().optional(),
    attributeOptionId: zod_1.z.string().uuid().optional(),
});
const imageSchema = zod_1.z.object({
    /** URL absoluta o ruta relativa pública, ej. /images/products/foto.svg */
    url: zod_1.z.string().min(1),
    altText: zod_1.z.string().optional(),
    sortOrder: zod_1.z.number().int().default(0),
    isPrimary: zod_1.z.boolean().default(false),
});
exports.createProductSchema = zod_1.z.object({
    categoryId: zod_1.z.string().uuid(),
    name: zod_1.z.string().min(1),
    slug: zod_1.z.string().min(1),
    description: zod_1.z.string(),
    basePrice: zod_1.z.number().positive(),
    previousPrice: zod_1.z.number().positive().optional().nullable(),
    stockQuantity: zod_1.z.number().int().min(0).default(0),
    isActive: zod_1.z.boolean().default(true),
    images: zod_1.z.array(imageSchema).optional(),
    attributeValues: zod_1.z.array(attributeValueSchema).optional(),
});
exports.updateProductSchema = exports.createProductSchema.partial();
exports.listProductsSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
    categoryId: zod_1.z.string().uuid().optional(),
    categorySlug: zod_1.z.string().optional(),
    search: zod_1.z.string().optional(),
    /** Si es true, incluye productos inactivos (panel admin) */
    includeInactive: zod_1.z
        .union([zod_1.z.boolean(), zod_1.z.enum(['true', 'false'])])
        .optional()
        .transform((v) => v === true || v === 'true'),
});
//# sourceMappingURL=product.validator.js.map