"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listAttributes = listAttributes;
exports.createAttribute = createAttribute;
const prisma_1 = require("../lib/prisma");
const error_handler_1 = require("../middleware/error-handler");
const attribute_validator_1 = require("../validators/attribute.validator");
async function listAttributes(query) {
    const { categoryId } = attribute_validator_1.listAttributesSchema.parse(query);
    const definitions = await prisma_1.prisma.attributeDefinition.findMany({
        where: categoryId
            ? { OR: [{ categoryId }, { categoryId: null }] }
            : undefined,
        include: {
            options: { orderBy: { sortOrder: 'asc' } },
            category: { select: { id: true, name: true, slug: true } },
        },
        orderBy: { sortOrder: 'asc' },
    });
    return definitions.map((def) => ({
        id: def.id,
        code: def.code,
        name: def.name,
        dataType: def.dataType,
        isRequired: def.isRequired,
        sortOrder: def.sortOrder,
        category: def.category,
        options: def.options.map((opt) => ({
            id: opt.id,
            value: opt.value,
            sortOrder: opt.sortOrder,
        })),
    }));
}
async function createAttribute(data) {
    const input = attribute_validator_1.createAttributeSchema.parse(data);
    const existing = await prisma_1.prisma.attributeDefinition.findUnique({
        where: { code: input.code },
    });
    if (existing)
        throw new error_handler_1.AppError(409, 'El código de atributo ya existe');
    const definition = await prisma_1.prisma.attributeDefinition.create({
        data: {
            categoryId: input.categoryId ?? null,
            code: input.code,
            name: input.name,
            dataType: input.dataType,
            isRequired: input.isRequired,
            sortOrder: input.sortOrder,
            options: input.options
                ? { create: input.options }
                : undefined,
        },
        include: {
            options: { orderBy: { sortOrder: 'asc' } },
            category: { select: { id: true, name: true, slug: true } },
        },
    });
    return {
        id: definition.id,
        code: definition.code,
        name: definition.name,
        dataType: definition.dataType,
        isRequired: definition.isRequired,
        sortOrder: definition.sortOrder,
        category: definition.category,
        options: definition.options,
    };
}
//# sourceMappingURL=attribute.service.js.map