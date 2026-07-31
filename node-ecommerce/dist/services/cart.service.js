"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AVAILABLE_TALLAS = void 0;
exports.getCart = getCart;
exports.addCartItem = addCartItem;
exports.updateCartItem = updateCartItem;
exports.removeCartItem = removeCartItem;
exports.clearCart = clearCart;
const zod_1 = require("zod");
const prisma_1 = require("../lib/prisma");
const error_handler_1 = require("../middleware/error-handler");
const product_mapper_1 = require("../mappers/product.mapper");
const decimal_1 = require("../utils/decimal");
exports.AVAILABLE_TALLAS = [
    '8',
    '10',
    '12',
    'XS',
    'S',
    'M',
    'L',
    'XL',
];
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
const addItemSchema = zod_1.z.object({
    productId: zod_1.z.string().uuid(),
    quantity: zod_1.z.number().int().positive().default(1),
    talla: zod_1.z.enum(exports.AVAILABLE_TALLAS),
});
const updateItemSchema = zod_1.z.object({
    quantity: zod_1.z.number().int().min(1),
});
async function getOrCreateCart(sessionToken) {
    return prisma_1.prisma.cart.upsert({
        where: { sessionToken },
        create: { sessionToken },
        update: {},
    });
}
function mapCartResponse(cart) {
    const items = cart.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        talla: item.talla,
        quantity: item.quantity,
        product: (0, product_mapper_1.mapProductToResponse)(item.product),
        lineTotal: (0, decimal_1.toNumber)(item.product.basePrice) * item.quantity,
    }));
    const total = items.reduce((sum, item) => sum + item.lineTotal, 0);
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    return {
        id: cart.id,
        sessionToken: cart.sessionToken,
        items,
        count,
        total,
    };
}
async function loadCart(sessionToken) {
    const cart = await prisma_1.prisma.cart.findUnique({
        where: { sessionToken },
        include: {
            items: {
                include: { product: { include: productInclude } },
                orderBy: { createdAt: 'asc' },
            },
        },
    });
    if (!cart) {
        return {
            id: null,
            sessionToken,
            items: [],
            count: 0,
            total: 0,
        };
    }
    return mapCartResponse(cart);
}
async function getCart(sessionToken) {
    if (!sessionToken?.trim()) {
        throw new error_handler_1.AppError(400, 'sessionToken es requerido');
    }
    return loadCart(sessionToken.trim());
}
async function addCartItem(sessionToken, data) {
    if (!sessionToken?.trim()) {
        throw new error_handler_1.AppError(400, 'sessionToken es requerido');
    }
    const input = addItemSchema.parse(data);
    const product = await prisma_1.prisma.product.findFirst({
        where: { id: input.productId, isActive: true },
    });
    if (!product)
        throw new error_handler_1.AppError(404, 'Producto no encontrado');
    if (product.stockQuantity < 1) {
        throw new error_handler_1.AppError(400, 'Producto sin stock');
    }
    const cart = await getOrCreateCart(sessionToken.trim());
    const existing = await prisma_1.prisma.cartItem.findUnique({
        where: {
            cartId_productId_talla: {
                cartId: cart.id,
                productId: input.productId,
                talla: input.talla,
            },
        },
    });
    if (existing) {
        await prisma_1.prisma.cartItem.update({
            where: { id: existing.id },
            data: { quantity: existing.quantity + input.quantity },
        });
    }
    else {
        await prisma_1.prisma.cartItem.create({
            data: {
                cartId: cart.id,
                productId: input.productId,
                talla: input.talla,
                quantity: input.quantity,
            },
        });
    }
    return loadCart(sessionToken.trim());
}
async function updateCartItem(sessionToken, itemId, data) {
    if (!sessionToken?.trim()) {
        throw new error_handler_1.AppError(400, 'sessionToken es requerido');
    }
    const input = updateItemSchema.parse(data);
    const cart = await prisma_1.prisma.cart.findUnique({
        where: { sessionToken: sessionToken.trim() },
    });
    if (!cart)
        throw new error_handler_1.AppError(404, 'Carrito no encontrado');
    const item = await prisma_1.prisma.cartItem.findFirst({
        where: { id: itemId, cartId: cart.id },
    });
    if (!item)
        throw new error_handler_1.AppError(404, 'Ítem no está en el carrito');
    await prisma_1.prisma.cartItem.update({
        where: { id: item.id },
        data: { quantity: input.quantity },
    });
    return loadCart(sessionToken.trim());
}
async function removeCartItem(sessionToken, itemId) {
    if (!sessionToken?.trim()) {
        throw new error_handler_1.AppError(400, 'sessionToken es requerido');
    }
    const cart = await prisma_1.prisma.cart.findUnique({
        where: { sessionToken: sessionToken.trim() },
    });
    if (!cart)
        throw new error_handler_1.AppError(404, 'Carrito no encontrado');
    const deleted = await prisma_1.prisma.cartItem.deleteMany({
        where: { id: itemId, cartId: cart.id },
    });
    if (deleted.count === 0) {
        throw new error_handler_1.AppError(404, 'Ítem no está en el carrito');
    }
    return loadCart(sessionToken.trim());
}
async function clearCart(sessionToken) {
    if (!sessionToken?.trim()) {
        throw new error_handler_1.AppError(400, 'sessionToken es requerido');
    }
    const cart = await prisma_1.prisma.cart.findUnique({
        where: { sessionToken: sessionToken.trim() },
    });
    if (!cart) {
        return {
            id: null,
            sessionToken: sessionToken.trim(),
            items: [],
            count: 0,
            total: 0,
        };
    }
    await prisma_1.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    return loadCart(sessionToken.trim());
}
//# sourceMappingURL=cart.service.js.map