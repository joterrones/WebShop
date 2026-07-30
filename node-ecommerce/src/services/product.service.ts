import { unlink } from 'fs/promises';
import { join } from 'path';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/error-handler';
import { mapProductToResponse, ProductRow } from '../mappers/product.mapper';
import { publicDir } from '../config/env';
import {
  createProductSchema,
  listProductsSchema,
  updateProductSchema,
} from '../validators/product.validator';

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

export async function listProducts(query: unknown) {
  const {
    page,
    limit,
    categoryId,
    categorySlug,
    search,
    isActive,
    includeInactive,
  } = listProductsSchema.parse(query);

  const where: Record<string, unknown> = {};
  if (isActive !== undefined) {
    where.isActive = isActive;
  } else if (!includeInactive) {
    where.isActive = true;
  }
  if (categoryId) where.categoryId = categoryId;
  if (categorySlug) {
    const category = await prisma.category.findUnique({
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
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: productInclude,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return {
    data: products.map((p: ProductRow) => mapProductToResponse(p)),
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getProductById(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: productInclude,
  });
  if (!product) throw new AppError(404, 'Producto no encontrado');
  return mapProductToResponse(product as ProductRow);
}

export async function createProduct(data: unknown) {
  const input = createProductSchema.parse(data);

  const existing = await prisma.product.findUnique({
    where: { slug: input.slug },
  });
  if (existing) throw new AppError(409, 'El slug del producto ya existe');

  const product = await prisma.product.create({
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

  return mapProductToResponse(product as ProductRow);
}

export async function updateProduct(id: string, data: unknown) {
  const input = updateProductSchema.parse(data);

  const existing = await prisma.product.findUnique({
    where: { id },
    include: { images: true },
  });
  if (!existing) throw new AppError(404, 'Producto no encontrado');

  if (input.slug && input.slug !== existing.slug) {
    const slugTaken = await prisma.product.findUnique({
      where: { slug: input.slug },
    });
    if (slugTaken) throw new AppError(409, 'El slug del producto ya existe');
  }

  if (input.images) {
    await prisma.productImage.deleteMany({ where: { productId: id } });
  }

  const product = await prisma.product.update({
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

  return mapProductToResponse(product as ProductRow);
}

export async function deleteProduct(id: string) {
  const existing = await prisma.product.findUnique({
    where: { id },
    include: { images: true },
  });
  if (!existing) throw new AppError(404, 'Producto no encontrado');

  await prisma.product.delete({ where: { id } });

  for (const image of existing.images) {
    await tryDeleteLocalImage(image.url);
  }

  return { message: 'Producto eliminado', id };
}

async function tryDeleteLocalImage(url: string): Promise<void> {
  if (!url.startsWith('/images/products/')) return;
  const filename = url.replace('/images/products/', '');
  if (!filename || filename.includes('..')) return;
  try {
    await unlink(join(publicDir, 'images', 'products', filename));
  } catch {
    // archivo ya no existe
  }
}

export async function getProductsByCategorySlug(slug: string, query: unknown) {
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) throw new AppError(404, 'Categoría no encontrada');
  const parsed = listProductsSchema.parse(query);
  return listProducts({ ...parsed, categoryId: category.id });
}
