/**
 * Convierte una ruta relativa de la carpeta pública en URL absoluta.
 * Ej: "/images/products/foo.svg" → "http://localhost:3000/images/products/foo.svg"
 * Si ya es URL absoluta (http/https), se devuelve igual.
 */
export declare function toPublicUrl(pathOrUrl: string): string;
/** Ruta relativa pública de una imagen de producto */
export declare function productImagePath(filename: string): string;
//# sourceMappingURL=media.d.ts.map