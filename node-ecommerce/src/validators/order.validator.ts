import { z } from 'zod';

const orderItemAttributeSchema = z.object({
  attributeCode: z.string(),
  attributeName: z.string(),
  value: z.string(),
});

const orderItemSchema = z.object({
  productId: z.string().uuid().optional(),
  productName: z.string().min(1),
  description: z.string(),
  talla: z.string().min(1),
  tipoTela: z.string().min(1),
  quantity: z.number().int().positive(),
  unitPrice: z.number().positive(),
  lineDiscount: z.number().min(0).default(0),
  attributes: z.array(orderItemAttributeSchema).optional(),
});

export const createOrderSchema = z.object({
  clientName: z.string().min(1),
  phoneNumber: z.string().min(1),
  province: z.string().min(1),
  country: z.string().min(1),
  shippingAddress: z.string().min(1),
  documentType: z.enum(['DNI', 'RUC']),
  documentNumber: z.string().min(1),
  shippingCost: z.number().min(0).default(0),
  notes: z.string().optional(),
  items: z.array(orderItemSchema).min(1),
});

export const listOrdersSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['pendiente', 'en_proceso', 'atendido']).optional(),
  documentNumber: z.string().optional(),
  search: z.string().optional(),
  fromDate: z.string().datetime().optional(),
  toDate: z.string().datetime().optional(),
});

export const updateOrderStatusSchema = z.object({
  toStatus: z.enum(['pendiente', 'en_proceso', 'atendido']),
  reason: z.string().optional(),
  changedBy: z.string().optional(),
});

export const createAdjustmentSchema = z.object({
  orderItemId: z.string().uuid().optional().nullable(),
  adjustmentType: z.enum([
    'discount_percent',
    'discount_fixed',
    'price_override',
  ]),
  value: z.number().positive(),
  reason: z.string().min(1),
});
