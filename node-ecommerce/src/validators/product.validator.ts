import { z } from 'zod';

const attributeValueSchema = z.object({
  attributeDefinitionId: z.string().uuid(),
  valueText: z.string().optional(),
  attributeOptionId: z.string().uuid().optional(),
});

const imageSchema = z.object({
  /** URL absoluta o ruta relativa pública, ej. /images/products/foto.svg */
  url: z.string().min(1),
  altText: z.string().optional(),
  sortOrder: z.number().int().default(0),
  isPrimary: z.boolean().default(false),
});

export const createProductSchema = z.object({
  categoryId: z.string().uuid(),
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string(),
  basePrice: z.number().positive(),
  previousPrice: z.number().positive().optional().nullable(),
  stockQuantity: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  images: z.array(imageSchema).optional(),
  attributeValues: z.array(attributeValueSchema).optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const listProductsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  categoryId: z.string().uuid().optional(),
  categorySlug: z.string().optional(),
  search: z.string().optional(),
  /** Filtra por activo/inactivo. Si no se envía, ver includeInactive. */
  isActive: z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .optional()
    .transform((v) => {
      if (v === undefined) return undefined;
      return v === true || v === 'true';
    }),
  /** Si es true y no hay isActive, incluye activos e inactivos (panel admin) */
  includeInactive: z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .optional()
    .transform((v) => v === true || v === 'true'),
});
