"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapProductToResponse = mapProductToResponse;
const decimal_1 = require("../utils/decimal");
const media_1 = require("../utils/media");
function mapProductToResponse(product) {
    const primaryImage = product.images.find((img) => img.isPrimary) ?? product.images[0];
    const attributes = {};
    for (const av of product.attributeValues) {
        const code = av.attributeDefinition.code;
        attributes[code] =
            av.attributeOption?.value ?? av.valueText ?? '';
    }
    return {
        id: product.id,
        name: product.name,
        description: product.description,
        urlImg: (0, media_1.toPublicUrl)(primaryImage?.url ?? ''),
        images: [...product.images]
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((img) => (0, media_1.toPublicUrl)(img.url)),
        imagePaths: [...product.images]
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((img) => img.url),
        category: product.category.slug,
        categoryId: product.categoryId,
        categoryName: product.category.name,
        price: (0, decimal_1.toNumber)(product.basePrice),
        previousPrice: product.previousPrice
            ? (0, decimal_1.toNumber)(product.previousPrice)
            : null,
        inStock: product.stockQuantity > 0 && product.isActive,
        stockQuantity: product.stockQuantity,
        isActive: product.isActive,
        attributes,
        slug: product.slug,
    };
}
//# sourceMappingURL=product.mapper.js.map