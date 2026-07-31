import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/error-handler';
import { AdjustmentTypeValue } from '../types/order-status';
import { roundMoney, toNumber } from '../utils/decimal';
import {
  createAdjustmentSchema,
  createOrderSchema,
  listOrdersSchema,
  setOrderDiscountSchema,
  updateOrderStatusSchema,
  updateShippingSchema,
} from '../validators/order.validator';
import { validateStatusTransition } from './order-status.service';

const orderInclude = {
  items: {
    include: { attributes: true, adjustments: true },
  },
  statusHistory: { orderBy: { changedAt: 'desc' as const } },
  adjustments: { orderBy: { appliedAt: 'desc' as const } },
};

async function generateOrderNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.order.count({
    where: {
      orderNumber: { startsWith: `PED-${year}-` },
    },
  });
  return `PED-${year}-${String(count + 1).padStart(5, '0')}`;
}

function mapOrderItem(item: {
  id: string;
  productId: string | null;
  productName: string;
  description: string;
  talla: string;
  tipoTela: string;
  quantity: number;
  unitPrice: { toString(): string } | number;
  lineDiscount: { toString(): string } | number;
  lineTotal: { toString(): string } | number;
  attributes: { attributeCode: string; attributeName: string; value: string }[];
}) {
  return {
    id: item.id,
    productId: item.productId,
    productName: item.productName,
    description: item.description,
    talla: item.talla,
    tipoTela: item.tipoTela,
    quantity: item.quantity,
    unitPrice: toNumber(item.unitPrice),
    lineDiscount: toNumber(item.lineDiscount),
    lineTotal: toNumber(item.lineTotal),
    attributes: item.attributes,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapOrder(order: any) {
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
    subtotal: toNumber(order.subtotal),
    discountTotal: toNumber(order.discountTotal),
    shippingCost: toNumber(order.shippingCost),
    total: toNumber(order.total),
    notes: order.notes,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    items: order.items.map(mapOrderItem),
    statusHistory: order.statusHistory.map((h: {
      id: string;
      fromStatus: string | null;
      toStatus: string;
      reason: string | null;
      changedAt: Date;
      changedBy: string | null;
    }) => ({
      id: h.id,
      fromStatus: h.fromStatus,
      toStatus: h.toStatus,
      reason: h.reason,
      changedAt: h.changedAt,
      changedBy: h.changedBy,
    })),
    adjustments: order.adjustments.map((a: {
      id: string;
      orderItemId: string | null;
      adjustmentType: string;
      value: { toString(): string } | number;
      reason: string;
      appliedAt: Date;
    }) => ({
      id: a.id,
      orderItemId: a.orderItemId,
      adjustmentType: a.adjustmentType,
      value: toNumber(a.value),
      reason: a.reason,
      appliedAt: a.appliedAt,
    })),
  };
}

export async function createOrder(data: unknown) {
  const input = createOrderSchema.parse(data);

  const itemsData = input.items.map((item) => {
    const lineSubtotal = item.unitPrice * item.quantity;
    const lineTotal = roundMoney(lineSubtotal - item.lineDiscount);
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

  const subtotal = roundMoney(
    itemsData.reduce((sum, item) => sum + item.lineTotal, 0),
  );
  const total = roundMoney(subtotal + input.shippingCost);
  const orderNumber = await generateOrderNumber();

  const order = await prisma.order.create({
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

export async function listOrders(query: unknown) {
  const { page, limit, status, documentNumber, search, fromDate, toDate } =
    listOrdersSchema.parse(query);

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
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
    const createdAt: Record<string, Date> = {};
    if (fromDate) createdAt.gte = new Date(fromDate);
    if (toDate) createdAt.lte = new Date(toDate);
    where.createdAt = createdAt;
  }

  const [total, orders] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
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

export async function getOrderById(id: string) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: orderInclude,
  });
  if (!order) throw new AppError(404, 'Pedido no encontrado');
  return mapOrder(order);
}

export async function updateOrderStatus(id: string, data: unknown) {
  const input = updateOrderStatusSchema.parse(data);

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) throw new AppError(404, 'Pedido no encontrado');

  validateStatusTransition(
    order.status as import('../types/order-status').OrderStatusType,
    input.toStatus,
    input.reason,
  );

  const updated = await prisma.$transaction(async (tx) => {
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

function calculateAdjustmentAmount(
  type: AdjustmentTypeValue,
  value: number,
  baseAmount: number,
): number {
  switch (type) {
    case 'discount_percent':
      return roundMoney(baseAmount * (value / 100));
    case 'discount_fixed':
      return roundMoney(Math.min(value, baseAmount));
    case 'price_override':
      return roundMoney(Math.max(0, baseAmount - value));
    default:
      return 0;
  }
}

export async function applyOrderAdjustment(orderId: string, data: unknown) {
  const input = createAdjustmentSchema.parse(data);

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, adjustments: true },
  });
  if (!order) throw new AppError(404, 'Pedido no encontrado');

  if (input.orderItemId) {
    const item = order.items.find(
      (i: { id: string }) => i.id === input.orderItemId,
    );
    if (!item) throw new AppError(404, 'Línea de pedido no encontrada');
  }

  await prisma.orderPriceAdjustment.create({
    data: {
      orderId,
      orderItemId: input.orderItemId ?? null,
      adjustmentType: input.adjustmentType,
      value: input.value,
      reason: input.reason,
    },
  });

  return recalculateOrderTotals(orderId);
}

/** Fija el descuento del pedido en soles (reemplaza descuentos a nivel pedido). */
export async function setOrderDiscount(orderId: string, data: unknown) {
  const input = setOrderDiscountSchema.parse(data);

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) throw new AppError(404, 'Pedido no encontrado');

  await prisma.orderPriceAdjustment.deleteMany({
    where: { orderId, orderItemId: null },
  });

  if (input.amount > 0) {
    await prisma.orderPriceAdjustment.create({
      data: {
        orderId,
        orderItemId: null,
        adjustmentType: 'discount_fixed',
        value: input.amount,
        reason: input.reason,
      },
    });
  }

  return recalculateOrderTotals(orderId);
}

export async function updateOrderShipping(orderId: string, data: unknown) {
  const input = updateShippingSchema.parse(data);

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new AppError(404, 'Pedido no encontrado');

  const total = roundMoney(
    toNumber(order.subtotal) - toNumber(order.discountTotal) + input.shippingCost,
  );

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { shippingCost: input.shippingCost, total },
    include: orderInclude,
  });

  return mapOrder(updated);
}

async function recalculateOrderTotals(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) throw new AppError(404, 'Pedido no encontrado');

  const itemsSubtotal = order.items.reduce(
    (sum: number, item: { lineTotal: { toString(): string } | number }) =>
      sum + toNumber(item.lineTotal),
    0,
  );

  const allAdjustments = await prisma.orderPriceAdjustment.findMany({
    where: { orderId },
    include: { orderItem: true },
  });

  let discountTotal = 0;

  for (const adj of allAdjustments) {
    if (adj.orderItemId && adj.orderItem) {
      const base = toNumber(adj.orderItem.lineTotal);
      discountTotal += calculateAdjustmentAmount(
        adj.adjustmentType as AdjustmentTypeValue,
        toNumber(adj.value),
        base,
      );
    } else if (!adj.orderItemId) {
      discountTotal += calculateAdjustmentAmount(
        adj.adjustmentType as AdjustmentTypeValue,
        toNumber(adj.value),
        itemsSubtotal,
      );
    }
  }

  discountTotal = roundMoney(discountTotal);
  const subtotal = roundMoney(itemsSubtotal);
  const total = roundMoney(
    subtotal - discountTotal + toNumber(order.shippingCost),
  );

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { discountTotal, subtotal, total },
    include: orderInclude,
  });

  return mapOrder(updated);
}
