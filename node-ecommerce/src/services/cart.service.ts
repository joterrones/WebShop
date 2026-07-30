import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/error-handler';
import { mapProductToResponse, ProductRow } from '../mappers/product.mapper';
import { toNumber } from '../utils/decimal';

export const AVAILABLE_TALLAS = [
  '8',
  '10',
  '12',
  'XS',
  'S',
  'M',
  'L',
  'XL',
] as const;

const productInclude = {
  category: true,
  images: { orderBy: { sortOrder: 'asc' as const } },
  attributeValues: {
    include: {
      attributeDefinition: true,
      attributeOption: true,
    },
  },
};

const addItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive().default(1),
  talla: z.enum(AVAILABLE_TALLAS),
});

const updateItemSchema = z.object({
  quantity: z.number().int().min(1),
});

async function getOrCreateCart(sessionToken: string) {
  return prisma.cart.upsert({
    where: { sessionToken },
    create: { sessionToken },
    update: {},
  });
}

function mapCartResponse(
  cart: {
    id: string;
    sessionToken: string;
    items: Array<{
      id: string;
      quantity: number;
      productId: string;
      talla: string;
      product: ProductRow;
    }>;
  },
) {
  const items = cart.items.map((item) => ({
    id: item.id,
    productId: item.productId,
    talla: item.talla,
    quantity: item.quantity,
    product: mapProductToResponse(item.product),
    lineTotal: toNumber(item.product.basePrice) * item.quantity,
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

async function loadCart(sessionToken: string) {
  const cart = await prisma.cart.findUnique({
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

  return mapCartResponse(cart as never);
}

export async function getCart(sessionToken: string) {
  if (!sessionToken?.trim()) {
    throw new AppError(400, 'sessionToken es requerido');
  }
  return loadCart(sessionToken.trim());
}

export async function addCartItem(sessionToken: string, data: unknown) {
  if (!sessionToken?.trim()) {
    throw new AppError(400, 'sessionToken es requerido');
  }

  const input = addItemSchema.parse(data);
  const product = await prisma.product.findFirst({
    where: { id: input.productId, isActive: true },
  });
  if (!product) throw new AppError(404, 'Producto no encontrado');
  if (product.stockQuantity < 1) {
    throw new AppError(400, 'Producto sin stock');
  }

  const cart = await getOrCreateCart(sessionToken.trim());

  const existing = await prisma.cartItem.findUnique({
    where: {
      cartId_productId_talla: {
        cartId: cart.id,
        productId: input.productId,
        talla: input.talla,
      },
    },
  });

  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + input.quantity },
    });
  } else {
    await prisma.cartItem.create({
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

export async function updateCartItem(
  sessionToken: string,
  itemId: string,
  data: unknown,
) {
  if (!sessionToken?.trim()) {
    throw new AppError(400, 'sessionToken es requerido');
  }

  const input = updateItemSchema.parse(data);
  const cart = await prisma.cart.findUnique({
    where: { sessionToken: sessionToken.trim() },
  });
  if (!cart) throw new AppError(404, 'Carrito no encontrado');

  const item = await prisma.cartItem.findFirst({
    where: { id: itemId, cartId: cart.id },
  });
  if (!item) throw new AppError(404, 'Ítem no está en el carrito');

  await prisma.cartItem.update({
    where: { id: item.id },
    data: { quantity: input.quantity },
  });

  return loadCart(sessionToken.trim());
}

export async function removeCartItem(sessionToken: string, itemId: string) {
  if (!sessionToken?.trim()) {
    throw new AppError(400, 'sessionToken es requerido');
  }

  const cart = await prisma.cart.findUnique({
    where: { sessionToken: sessionToken.trim() },
  });
  if (!cart) throw new AppError(404, 'Carrito no encontrado');

  const deleted = await prisma.cartItem.deleteMany({
    where: { id: itemId, cartId: cart.id },
  });
  if (deleted.count === 0) {
    throw new AppError(404, 'Ítem no está en el carrito');
  }

  return loadCart(sessionToken.trim());
}

export async function clearCart(sessionToken: string) {
  if (!sessionToken?.trim()) {
    throw new AppError(400, 'sessionToken es requerido');
  }

  const cart = await prisma.cart.findUnique({
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

  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  return loadCart(sessionToken.trim());
}
