"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listAttributesSchema = exports.createAttributeSchema = void 0;
const zod_1 = require("zod");
exports.createAttributeSchema = zod_1.z.object({
    categoryId: zod_1.z.string().uuid().optional().nullable(),
    code: zod_1.z.string().min(1),
    name: zod_1.z.string().min(1),
    dataType: zod_1.z.enum(['text', 'number', 'select', 'boolean']),
    isRequired: zod_1.z.boolean().default(false),
    sortOrder: zod_1.z.number().int().default(0),
    options: zod_1.z
        .array(zod_1.z.object({
        value: zod_1.z.string().min(1),
        sortOrder: zod_1.z.number().int().default(0),
    }))
        .optional(),
});
exports.listAttributesSchema = zod_1.z.object({
    categoryId: zod_1.z.string().uuid().optional(),
});
//# sourceMappingURL=attribute.validator.js.map