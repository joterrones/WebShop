import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/error-handler';
import {
  createAttributeSchema,
  listAttributesSchema,
} from '../validators/attribute.validator';

export async function listAttributes(query: unknown) {
  const { categoryId } = listAttributesSchema.parse(query);

  const definitions = await prisma.attributeDefinition.findMany({
    where: categoryId
      ? { OR: [{ categoryId }, { categoryId: null }] }
      : undefined,
    include: {
      options: { orderBy: { sortOrder: 'asc' } },
      category: { select: { id: true, name: true, slug: true } },
    },
    orderBy: { sortOrder: 'asc' },
  });

  return definitions.map((def: (typeof definitions)[number]) => ({
    id: def.id,
    code: def.code,
    name: def.name,
    dataType: def.dataType,
    isRequired: def.isRequired,
    sortOrder: def.sortOrder,
    category: def.category,
    options: def.options.map((opt: (typeof def.options)[number]) => ({
      id: opt.id,
      value: opt.value,
      sortOrder: opt.sortOrder,
    })),
  }));
}

export async function createAttribute(data: unknown) {
  const input = createAttributeSchema.parse(data);

  const existing = await prisma.attributeDefinition.findUnique({
    where: { code: input.code },
  });
  if (existing) throw new AppError(409, 'El código de atributo ya existe');

  const definition = await prisma.attributeDefinition.create({
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
