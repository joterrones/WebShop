import { z } from 'zod';

export const createAttributeSchema = z.object({
  categoryId: z.string().uuid().optional().nullable(),
  code: z.string().min(1),
  name: z.string().min(1),
  dataType: z.enum(['text', 'number', 'select', 'boolean']),
  isRequired: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
  options: z
    .array(
      z.object({
        value: z.string().min(1),
        sortOrder: z.number().int().default(0),
      }),
    )
    .optional(),
});

export const listAttributesSchema = z.object({
  categoryId: z.string().uuid().optional(),
});
