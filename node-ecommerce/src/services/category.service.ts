import { prisma } from '../lib/prisma';

export async function listCategoriesTree() {
  const categories = await prisma.category.findMany({
    where: { isActive: true, parentId: null },
    orderBy: { sortOrder: 'asc' },
    include: {
      children: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      },
    },
  });

  return categories.map((cat: (typeof categories)[number]) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    sortOrder: cat.sortOrder,
    children: cat.children.map((child: (typeof cat.children)[number]) => ({
      id: child.id,
      name: child.name,
      slug: child.slug,
      sortOrder: child.sortOrder,
    })),
  }));
}
