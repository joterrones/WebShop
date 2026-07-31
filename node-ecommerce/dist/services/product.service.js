"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listProducts = listProducts;
exports.getProductById = getProductById;
exports.createProduct = createProduct;
exports.updateProduct = updateProduct;
exports.deleteProduct = deleteProduct;
exports.getProductsByCategorySlug = getProductsByCategorySlug;
const promises_1 = require("fs/promises");
const path_1 = require("path");
const prisma_1 = require("../lib/prisma");
const error_handler_1 = require("../middleware/error-handler");
const product_mapper_1 = require("../mappers/product.mapper");
const env_1 = require("../config/env");
const product_validator_1 = require("../validators/product.validator");
const productInclude = {
    category: true,
    images: { orderBy: { sortOrder: 'asc' } },
    attributeValues: {
        include: {
            attributeDefinition: true,
            attributeOption: true,
        },
    },
};
async function listProducts(query) {
    const { page, limit, categoryId, categorySlug, search, includeInactive } = product_validator_1.listProductsSchema.parse(query);
    const where = {};
    if (!includeInactive) {
        where.isActive = true;
    }
    if (categoryId)
        where.categoryId = categoryId;
    if (categorySlug) {
        const category = await prisma_1.prisma.category.findUnique({
            where: { slug: categorySlug },
        });
        if (!category) {
            return { data: [], meta: { page, limit, total: 0, totalPages: 0 } };
        }
        where.categoryId = category.id;
    }
    if (search) {
        where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
        ];
    }
    const [total, products] = await Promise.all([
        prisma_1.prisma.product.count({ where }),
        prisma_1.prisma.product.findMany({
            where,
            include: productInclude,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { createdAt: 'desc' },
        }),
    ]);
    return {
        data: products.map((p) => (0, product_mapper_1.mapProductToResponse)(p)),
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}
async function getProductById(id) {
    const product = await prisma_1.prisma.product.findUnique({
        where: { id },
        include: productInclude,
    });
    if (!product)
        throw new error_handler_1.AppError(404, 'Producto no encontrado');
    return (0, product_mapper_1.mapProductToResponse)(product);
}
async function createProduct(data) {
    const input = product_validator_1.createProductSchema.parse(data);
    const existing = await prisma_1.prisma.product.findUnique({
        where: { slug: input.slug },
    });
    if (existing)
        throw new error_handler_1.AppError(409, 'El slug del producto ya existe');
    const product = await prisma_1.prisma.product.create({
        data: {
            categoryId: input.categoryId,
            name: input.name,
            slug: input.slug,
            description: input.description,
            basePrice: input.basePrice,
            previousPrice: input.previousPrice ?? null,
            stockQuantity: input.stockQuantity,
            isActive: input.isActive,
            images: input.images
                ? {
                    create: input.images,
                }
                : undefined,
            attributeValues: input.attributeValues
                ? {
                    create: input.attributeValues.map((av) => ({
                        attributeDefinitionId: av.attributeDefinitionId,
                        valueText: av.valueText,
                        attributeOptionId: av.attributeOptionId,
                    })),
                }
                : undefined,
        },
        include: productInclude,
    });
    return (0, product_mapper_1.mapProductToResponse)(product);
}
async function updateProduct(id, data) {
    const input = product_validator_1.updateProductSchema.parse(data);
    const existing = await prisma_1.prisma.product.findUnique({
        where: { id },
        include: { images: true },
    });
    if (!existing)
        throw new error_handler_1.AppError(404, 'Producto no encontrado');
    if (input.slug && input.slug !== existing.slug) {
        const slugTaken = await prisma_1.prisma.product.findUnique({
            where: { slug: input.slug },
        });
        if (slugTaken)
            throw new error_handler_1.AppError(409, 'El slug del producto ya existe');
    }
    if (input.images) {
        await prisma_1.prisma.productImage.deleteMany({ where: { productId: id } });
    }
    const product = await prisma_1.prisma.product.update({
        where: { id },
        data: {
            categoryId: input.categoryId,
            name: input.name,
            slug: input.slug,
            description: input.description,
            basePrice: input.basePrice,
            previousPrice: input.previousPrice,
            stockQuantity: input.stockQuantity,
            isActive: input.isActive,
            images: input.images
                ? {
                    create: input.images,
                }
                : undefined,
        },
        include: productInclude,
    });
    return (0, product_mapper_1.mapProductToResponse)(product);
}
async function deleteProduct(id) {
    const existing = await prisma_1.prisma.product.findUnique({
        where: { id },
        include: { images: true },
    });
    if (!existing)
        throw new error_handler_1.AppError(404, 'Producto no encontrado');
    await prisma_1.prisma.product.delete({ where: { id } });
    for (const image of existing.images) {
        await tryDeleteLocalImage(image.url);
    }
    return { message: 'Producto eliminado', id };
}
async function tryDeleteLocalImage(url) {
    if (!url.startsWith('/images/products/'))
        return;
    const filename = url.replace('/images/products/', '');
    if (!filename || filename.includes('..'))
        return;
    try {
        await (0, promises_1.unlink)((0, path_1.join)(env_1.publicDir, 'images', 'products', filename));
    }
    catch {
        // archivo ya no existe
    }
}
async function getProductsByCategorySlug(slug, query) {
    const category = await prisma_1.prisma.category.findUnique({ where: { slug } });
    if (!category)
        throw new error_handler_1.AppError(404, 'Categoría no encontrada');
    const parsed = product_validator_1.listProductsSchema.parse(query);
    return listProducts({ ...parsed, categoryId: category.id });
}
//# sourceMappingURL=product.service.js.map