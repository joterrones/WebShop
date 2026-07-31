"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listCategoriesTree = listCategoriesTree;
const prisma_1 = require("../lib/prisma");
async function listCategoriesTree() {
    const categories = await prisma_1.prisma.category.findMany({
        where: { isActive: true, parentId: null },
        orderBy: { sortOrder: 'asc' },
        include: {
            children: {
                where: { isActive: true },
                orderBy: { sortOrder: 'asc' },
            },
        },
    });
    return categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        sortOrder: cat.sortOrder,
        children: cat.children.map((child) => ({
            id: child.id,
            name: child.name,
            slug: child.slug,
            sortOrder: child.sortOrder,
        })),
    }));
}
//# sourceMappingURL=category.service.js.map