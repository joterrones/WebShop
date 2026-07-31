# node-ecommerce

Backend Express + PostgreSQL para tienda de artículos deportivos.

## Requisitos

- Node.js 18+
- PostgreSQL 14+

## Configuración

```bash
cd node-ecommerce
npm install
# El .env se genera desde la raíz: en Ecomerce2026/ ejecuta npm run sync-env
```

Ejemplo de `.env` con Docker:

```
DATABASE_URL=postgresql://postgres:123@/ecomerce
PORT=3900
CORS_ORIGIN=http://localhost:4900
JWT_SECRET=alaba-sport-dev-secret-change-me
JWT_EXPIRES_IN=8h
```

Levantar PostgreSQL (opcional):

```bash
docker compose up -d
```

Migrar y poblar datos (solo la primera vez o si la BD está vacía):

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

- `db:migrate` aplica migraciones pendientes **sin** borrar datos ni ejecutar seed.
- `db:seed` es idempotente: si ya hay categorías, no recrea el catálogo; **sí asegura** el usuario admin.
- Para crear una migración nueva en local: `npm run db:migrate:dev` (también sin seed).
- Para **borrar todo** y volver a cargar el demo: `npm run db:seed:reset` (destructivo, solo a propósito).

### Autenticación (admin)

- Login: `POST /api/auth/login` con `{ "username", "password" }` → JWT
- Usuario demo: **admin** / **admin123**
- Usuario admin: **administrador** / **daniel**
- Rutas de administración (listar/cambiar pedidos, CRUD productos, WhatsApp) requieren header `Authorization: Bearer <token>` y rol `admin`
- Checkout (`POST /api/orders`) y lecturas de catálogo siguen siendo públicas

Frontend: `/login` — tras iniciar sesión como admin aparecen **Pedidos** y **Admin** en el menú.
Si `prisma generate` falla por certificados SSL en tu red:

```powershell
$env:NODE_TLS_REJECT_UNAUTHORIZED=0
npx prisma generate
```

API disponible en `http://34.237.18.97:3900/api`

## Imágenes de productos

Las imágenes se sirven desde la carpeta `public/images/` como archivos estáticos:

| Carpeta física | URL pública |
|----------------|-------------|
| `public/images/products/` | `http://34.237.18.97:3900/images/products/<archivo>` |

En la BD se guarda la **ruta relativa** (ej. `/images/products/camiseta-futbol-pro-1.svg`).  
La API responde con la URL absoluta usando `PUBLIC_BASE_URL`.

Generar placeholders de demo:

```powershell
npm run images:generate
npm run db:seed          # solo si la BD está vacía
# o, para recrear el demo desde cero:
# npm run db:seed:reset
```

Para usar tus propias fotos: copia JPG/PNG a `public/images/products/` y actualiza `product_images.url` (o crea el producto con esa ruta).

## Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/auth/login` | Login (usuario + clave) → JWT |
| GET | `/api/auth/me` | Usuario actual (Bearer) |
| GET | `/api/categories` | Árbol de categorías |
| GET | `/api/categories/:slug/products` | Productos por categoría |
| GET | `/api/products` | Listado de productos |
| POST | `/api/products/upload` | Subir imágenes (admin) |
| GET | `/api/products/:id` | Detalle de producto |
| POST | `/api/products` | Crear producto (admin) |
| PUT | `/api/products/:id` | Actualizar producto (admin) |
| DELETE | `/api/products/:id` | Eliminar producto (admin) |
| GET | `/api/attributes` | Definiciones EAV |
| POST | `/api/attributes` | Crear atributo (admin) |
| POST | `/api/orders` | Crear pedido (público / checkout) |
| GET | `/api/orders` | Listar pedidos (admin) |
| GET | `/api/orders/:id` | Detalle de pedido (admin) |
| PATCH | `/api/orders/:id/status` | Cambiar estado (admin) |
| POST | `/api/orders/:id/adjustments` | Aplicar descuento/ajuste (admin) |
| GET | `/api/settings/whatsapp` | Obtener número WhatsApp de pedidos |
| PUT | `/api/settings/whatsapp` | Actualizar número WhatsApp (admin) |
| GET | `/api/cart` | Obtener carrito (header `x-cart-session`) |
| POST | `/api/cart/items` | Agregar producto al carrito (persiste en BD) |
| PATCH | `/api/cart/items/:productId` | Actualizar cantidad |
| DELETE | `/api/cart/items/:productId` | Quitar ítem |
| DELETE | `/api/cart` | Vaciar carrito |

## Estados de pedido

`pendiente` → `en_proceso` → `atendido`

Los retrocesos requieren el campo `reason` en el body.
