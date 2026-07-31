import { env } from '../config/env';

/**
 * Convierte una ruta relativa de la carpeta pública en URL absoluta.
 * Ej: "/images/products/foo.svg" → "http://localhost:3900/images/products/foo.svg"
 * Si ya es URL absoluta (http/https), se devuelve igual.
 */
export function toPublicUrl(pathOrUrl: string): string {
  if (!pathOrUrl) return '';
  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }
  const base = env.PUBLIC_BASE_URL.replace(/\/$/, '');
  const path = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  return `${base}${path}`;
}

/** Ruta relativa pública de una imagen de producto */
export function productImagePath(filename: string): string {
  return `/images/products/${filename}`;
}
