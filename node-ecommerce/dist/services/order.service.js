"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrder = createOrder;
exports.listOrders = listOrders;
exports.getOrderById = getOrderById;
exports.updateOrderStatus = updateOrderStatus;
exports.applyOrderAdjustment = applyOrderAdjustment;
const prisma_1 = require("../lib/prisma");
const error_handler_1 = require("../middleware/error-handler");
const decimal_1 = require("../utils/decimal");
const order_validator_1 = require("../validators/order.validator");
const order_status_service_1 = require("./order-status.service");
const orderInclude = {
    items: {
        include: { attributes: true, adjustments: true },
    },
    statusHistory: { orderBy: { changedAt: 'desc' } },
    adjustments: { orderBy: { appliedAt: 'desc' } },
};
async function generateOrderNumber() {
    const year = new Date().getFullYear();
    const count = await prisma_1.prisma.order.count({
        where: {
            orderNumber: { startsWith: `PED-${year}-` },
        },
    });
    return `PED-${year}-${String(count + 1).padStart(5, '0')}`;
}
function mapOrderItem(item) {
    return {
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        description: item.description,
        talla: item.talla,
        tipoTela: item.tipoTela,
        quantity: item.quantity,
        unitPrice: (0, decimal_1.toNumber)(item.unitPrice),
        lineDiscount: (0, decimal_1.toNumber)(item.lineDiscount),
        lineTotal: (0, decimal_1.toNumber)(item.lineTotal),
        attributes: item.attributes,
    };
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapOrder(order) {
    return {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        clientName: order.clientName,
        phoneNumber: order.phoneNumber,
        province: order.province,
        country: order.country,
        shippingAddress: order.shippingAddress,
        documentType: order.documentType,
        documentNumber: order.documentNumber,
        subtotal: (0, decimal_1.toNumber)(order.subtotal),
        discountTotal: (0, decimal_1.toNumber)(order.discountTotal),
        shippingCost: (0, decimal_1.toNumber)(order.shippingCost),
        total: (0, decimal_1.toNumber)(order.total),
        notes: order.notes,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        items: order.items.map(mapOrderItem),
        statusHistory: order.statusHistory.map((h) => ({
            id: h.id,
            fromStatus: h.fromStatus,
            toStatus: h.toStatus,
            reason: h.reason,
            changedAt: h.changedAt,
            changedBy: h.changedBy,
        })),
        adjustments: order.adjustments.map((a) => ({
            id: a.id,
            orderItemId: a.orderItemId,
            adjustmentType: a.adjustmentType,
            value: (0, decimal_1.toNumber)(a.value),
            reason: a.reason,
            appliedAt: a.appliedAt,
        })),
    };
}
async function createOrder(data) {
    const input = order_validator_1.createOrderSchema.parse(data);
    const itemsData = input.items.map((item) => {
        const lineSubtotal = item.unitPrice * item.quantity;
        const lineTotal = (0, decimal_1.roundMoney)(lineSubtotal - item.lineDiscount);
        return {
            productId: item.productId ?? null,
            productName: item.productName,
            description: item.description,
            talla: item.talla,
            tipoTela: item.tipoTela,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            lineDiscount: item.lineDiscount,
            lineTotal,
            attributes: item.attributes
                ? { create: item.attributes }
                : undefined,
        };
    });
    const subtotal = (0, decimal_1.roundMoney)(itemsData.reduce((sum, item) => sum + item.lineTotal, 0));
    const total = (0, decimal_1.roundMoney)(subtotal + input.shippingCost);
    const orderNumber = await generateOrderNumber();
    const order = await prisma_1.prisma.order.create({
        data: {
            orderNumber,
            status: 'pendiente',
            clientName: input.clientName,
            phoneNumber: input.phoneNumber,
            province: input.province,
            country: input.country,
            shippingAddress: input.shippingAddress,
            documentType: input.documentType,
            documentNumber: input.documentNumber,
            subtotal,
            discountTotal: 0,
            shippingCost: input.shippingCost,
            total,
            notes: input.notes,
            items: { create: itemsData },
            statusHistory: {
                create: {
                    fromStatus: null,
                    toStatus: 'pendiente',
                    reason: 'Pedido creado',
                },
            },
        },
        include: orderInclude,
    });
    return mapOrder(order);
}
async function listOrders(query) {
    const { page, limit, status, documentNumber, search, fromDate, toDate } = order_validator_1.listOrdersSchema.parse(query);
    const where = {};
    if (status)
        where.status = status;
    if (documentNumber) {
        where.documentNumber = { contains: documentNumber, mode: 'insensitive' };
    }
    if (search) {
        where.OR = [
            { orderNumber: { contains: search, mode: 'insensitive' } },
            { clientName: { contains: search, mode: 'insensitive' } },
            { documentNumber: { contains: search, mode: 'insensitive' } },
            { phoneNumber: { contains: search, mode: 'insensitive' } },
        ];
    }
    if (fromDate || toDate) {
        const createdAt = {};
        if (fromDate)
            createdAt.gte = new Date(fromDate);
        if (toDate)
            createdAt.lte = new Date(toDate);
        where.createdAt = createdAt;
    }
    const [total, orders] = await Promise.all([
        prisma_1.prisma.order.count({ where }),
        prisma_1.prisma.order.findMany({
            where,
            include: orderInclude,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { createdAt: 'desc' },
        }),
    ]);
    return {
        data: orders.map(mapOrder),
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
}
async function getOrderById(id) {
    const order = await prisma_1.prisma.order.findUnique({
        where: { id },
        include: orderInclude,
    });
    if (!order)
        throw new error_handler_1.AppError(404, 'Pedido no encontrado');
    return mapOrder(order);
}
async function updateOrderStatus(id, data) {
    const input = order_validator_1.updateOrderStatusSchema.parse(data);
    const order = await prisma_1.prisma.order.findUnique({ where: { id } });
    if (!order)
        throw new error_handler_1.AppError(404, 'Pedido no encontrado');
    (0, order_status_service_1.validateStatusTransition)(order.status, input.toStatus, input.reason);
    const updated = await prisma_1.prisma.$transaction(async (tx) => {
        await tx.orderStatusHistory.create({
            data: {
                orderId: id,
                fromStatus: order.status,
                toStatus: input.toStatus,
                reason: input.reason,
                changedBy: input.changedBy,
            },
        });
        return tx.order.update({
            where: { id },
            data: { status: input.toStatus },
            include: orderInclude,
        });
    });
    return mapOrder(updated);
}
function calculateAdjustmentAmount(type, value, baseAmount) {
    switch (type) {
        case 'discount_percent':
            return (0, decimal_1.roundMoney)(baseAmount * (value / 100));
        case 'discount_fixed':
            return (0, decimal_1.roundMoney)(Math.min(value, baseAmount));
        case 'price_override':
            return (0, decimal_1.roundMoney)(Math.max(0, baseAmount - value));
        default:
            return 0;
    }
}
async function applyOrderAdjustment(orderId, data) {
    const input = order_validator_1.createAdjustmentSchema.parse(data);
    const order = await prisma_1.prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true, adjustments: true },
    });
    if (!order)
        throw new error_handler_1.AppError(404, 'Pedido no encontrado');
    if (input.orderItemId) {
        const item = order.items.find((i) => i.id === input.orderItemId);
        if (!item)
            throw new error_handler_1.AppError(404, 'Línea de pedido no encontrada');
    }
    await prisma_1.prisma.orderPriceAdjustment.create({
        data: {
            orderId,
            orderItemId: input.orderItemId ?? null,
            adjustmentType: input.adjustmentType,
            value: input.value,
            reason: input.reason,
        },
    });
    const itemsSubtotal = order.items.reduce((sum, item) => sum + (0, decimal_1.toNumber)(item.lineTotal), 0);
    const allAdjustments = await prisma_1.prisma.orderPriceAdjustment.findMany({
        where: { orderId },
        include: { orderItem: true },
    });
    let discountTotal = 0;
    for (const adj of allAdjustments) {
        if (adj.orderItemId && adj.orderItem) {
            const base = (0, decimal_1.toNumber)(adj.orderItem.lineTotal);
            discountTotal += calculateAdjustmentAmount(adj.adjustmentType, (0, decimal_1.toNumber)(adj.value), base);
        }
        else if (!adj.orderItemId) {
            discountTotal += calculateAdjustmentAmount(adj.adjustmentType, (0, decimal_1.toNumber)(adj.value), itemsSubtotal);
        }
    }
    discountTotal = (0, decimal_1.roundMoney)(discountTotal);
    const subtotal = (0, decimal_1.roundMoney)(itemsSubtotal);
    const total = (0, decimal_1.roundMoney)(subtotal - discountTotal + (0, decimal_1.toNumber)(order.shippingCost));
    const updated = await prisma_1.prisma.order.update({
        where: { id: orderId },
        data: { discountTotal, subtotal, total },
        include: orderInclude,
    });
    return mapOrder(updated);
}
//# sourceMappingURL=order.service.js.map