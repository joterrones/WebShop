"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toPublicUrl = toPublicUrl;
exports.productImagePath = productImagePath;
const env_1 = require("../config/env");
/**
 * Convierte una ruta relativa de la carpeta pública en URL absoluta.
 * Ej: "/images/products/foo.svg" → "http://localhost:3000/images/products/foo.svg"
 * Si ya es URL absoluta (http/https), se devuelve igual.
 */
function toPublicUrl(pathOrUrl) {
    if (!pathOrUrl)
        return '';
    if (/^https?:\/\//i.test(pathOrUrl)) {
        return pathOrUrl;
    }
    const base = env_1.env.PUBLIC_BASE_URL.replace(/\/$/, '');
    const path = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
    return `${base}${path}`;
}
/** Ruta relativa pública de una imagen de producto */
function productImagePath(filename) {
    return `/images/products/${filename}`;
}
//# sourceMappingURL=media.js.map