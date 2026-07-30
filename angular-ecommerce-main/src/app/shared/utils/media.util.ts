import { environment } from '../../../environments/environment';

/**
 * Resuelve URLs de imágenes del catálogo publicadas por el backend
 * desde `public/images/products` → `http://localhost:3000/images/products/...`
 */
export function resolveMediaUrl(pathOrUrl: string | null | undefined): string {
  if (!pathOrUrl) {
    return '';
  }

  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }

  const base = environment.mediaBaseUrl.replace(/\/$/, '');

  // Ruta relativa del backend: /images/products/foo.svg
  if (pathOrUrl.startsWith('/')) {
    return `${base}${pathOrUrl}`;
  }

  // Solo nombre de archivo → carpeta de productos
  return `${base}/images/products/${pathOrUrl}`;
}
