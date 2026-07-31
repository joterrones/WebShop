# Ecomerce2026 — Tienda deportiva

Monorepo con una tienda online de artículos deportivos. Incluye un **frontend** en Angular y un **backend** en Node.js con PostgreSQL.

```
Ecomerce2026/
├── .env                      # Config central (no se sube a git)
├── .env.example              # Plantilla
├── scripts/sync-env.mjs      # Sincroniza Angular + Prisma
├── angular-ecommerce-main/   # Frontend (ALABA Sport)
├── node-ecommerce/           # Backend API REST
└── README.md
```

---

## Configuración central (un solo `.env`)

Toda la conexión a BD, puertos, CORS y URLs del API se editan en la **raíz**:

```bash
cp .env.example .env
# edita .env
npm run sync-env
```

Eso regenera:

- `node-ecommerce/.env` (para Prisma y el API)
- `angular-ecommerce-main/src/environments/environment*.ts`
- el puerto de `ng serve` en el `package.json` del frontend

Scripts útiles desde la raíz:

| Comando | Qué hace |
|---------|----------|
| `npm run sync-env` | Aplica el `.env` a ambos proyectos |
| `npm run dev:api` | Backend en modo watch |
| `npm run dev:web` | Frontend Angular |
| `npm run build:api` / `build:web` | Builds de producción |
| `npm run db:migrate` / `db:seed` | Base de datos |

---

## Descripción general

| Proyecto | Carpeta | Tecnología | Puerto por defecto |
|----------|---------|------------|-------------------|
| **Frontend** | `angular-ecommerce-main` | Angular 19, Tailwind CSS | `4900` |
| **Backend** | `node-ecommerce` | Express, Prisma, PostgreSQL | `3900` |

El frontend consume la API del backend para listar productos, filtrar por categoría deportiva y registrar pedidos con datos del cliente (DNI/RUC, despacho, etc.).

---

## Conexión a la base de datos

| Parte | ¿BD? | Detalle |
|--------|------|---------|
| **`node-ecommerce`** | Sí | PostgreSQL vía Prisma (`DATABASE_URL`) |
| **`angular-ecommerce-main`** | No | Solo llama a la API (`http://34.237.18.97:3900/api`) |

Credenciales y URLs: edita **`Ecomerce2026/.env`** (ver `.env.example`) y ejecuta `npm run sync-env`.

Ahí se guardan categorías, productos, atributos EAV, imágenes y pedidos.

Las **imágenes de productos** se publican como estáticos desde `node-ecommerce/public/images/`:

- Carpeta: `public/images/products/`
- URL: `http://34.237.18.97:3900/images/products/<archivo>`

---

## Requisitos previos (ambos proyectos)

- [Node.js](https://nodejs.org/) 18 o superior
- [npm](https://www.npmjs.com/) 9 o superior
- [PostgreSQL](https://www.postgresql.org/) 14+ **o** [Docker](https://www.docker.com/) (para levantar la base de datos con un solo comando)

Opcional para el frontend:

- [Angular CLI](https://angular.dev/tools/cli) 19 (`npm install -g @angular/cli`)

---

## Cómo ejecutar todo el sistema

Sigue estos pasos en orden la primera vez. Después solo necesitas levantar backend y frontend.

### 1. Configuración y backend

```bash
# En la raíz Ecomerce2026/
cp .env.example .env
# Edita DATABASE_URL, PORT, CORS_ORIGIN, PUBLIC_BASE_URL, API_URL, MEDIA_BASE_URL
npm run sync-env

cd node-ecommerce
npm install
```

**Opción A — PostgreSQL con Docker (recomendado):**

```powershell
docker compose up -d
```

**Opción B — PostgreSQL ya instalado en tu máquina:** crea la base `ecomerce` y ajusta `DATABASE_URL` en `.env`.

**Migraciones y datos de prueba:**

```powershell
npm run db:generate
npm run db:migrate
npm run db:seed
```

- `db:migrate` solo aplica migraciones pendientes; **no** restaura ni borra datos.
- `db:seed` solo inserta el demo si la BD está vacía (idempotente).
- Para crear migraciones nuevas: `npm run db:migrate:dev`.
- Para borrar todo y reseedar a propósito: `npm run db:seed:reset`.

Si `prisma generate` falla por certificados SSL en tu red:

```powershell
$env:NODE_TLS_REJECT_UNAUTHORIZED=0
npx prisma generate
```

**Iniciar el servidor API:**

```powershell
npm run dev
```

Comprueba que responde: [http://34.237.18.97:3900/api/health](http://34.237.18.97:3900/api/health)

---

### 2. Frontend Angular

**Desarrollo** (otra terminal):

```bash
cd angular-ecommerce-main
npm install
npm start
```

Abre: [http://localhost:4900](http://localhost:4900)

**Producción / PM2:**

```bash
# Desde la raíz del monorepo
npm run sync-env
cd angular-ecommerce-main
npm install
npm run build          # genera dist/amazon-frontend/browser
PORT=4900 npm run start:prod   # server.js (Express + SPA)
```

Ejemplo PM2: ver `ecosystem.webshop.example.js` en la raíz.

```js
{
  name: 'ecomerce_front',
  cwd: '/proyecto/webshop/WebShop/angular-ecommerce-main',
  script: 'server.js',
  env: { PORT: 4900 },
}
```

Las URLs del API salen del `.env` raíz (`API_URL`, `MEDIA_BASE_URL`) vía `npm run sync-env`.

---

## Proyecto: `node-ecommerce` (Backend)

### Qué hace

API REST para un ecommerce deportivo con:

- **Catálogo:** categorías (Fútbol, Running, Gym, etc.), productos con varias imágenes.
- **Atributos dinámicos (EAV):** talla, tipo de tela, color, marca, etc., configurables por categoría.
- **Pedidos:** cabecera con datos del cliente (nombre o razón social, teléfono, provincia, país, dirección de despacho, DNI/RUC).
- **Detalle de pedido:** snapshot de producto (nombre, talla, tela, unidades, precios).
- **Trazabilidad:** estados `pendiente` → `en_proceso` → `atendido` (con retrocesos y motivo).
- **Ajustes de precio:** descuentos o modificaciones por pedido o por línea.

### Estructura principal

```
node-ecommerce/
├── prisma/
│   ├── schema.prisma      # Modelo de datos
│   ├── migrations/        # Migraciones SQL
│   └── seed.ts            # Datos demo (idempotente; reset solo con db:seed:reset)
├── src/
│   ├── routes/            # Rutas Express (/api/...)
│   ├── services/          # Lógica de negocio
│   ├── controllers/
│   └── validators/        # Validación con Zod
├── docker-compose.yml     # PostgreSQL local
└── .env.example
```

### Scripts útiles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor en modo desarrollo (recarga automática) |
| `npm run build` | Compila TypeScript a `dist/` |
| `npm start` | Ejecuta build de producción |
| `npm run db:migrate` | Aplica migraciones pendientes (`migrate deploy`, sin seed) |
| `npm run db:migrate:dev` | Crea/aplica migraciones en local (`migrate dev --skip-seed`) |
| `npm run db:seed` | Inserta demo solo si la BD está vacía (idempotente) |
| `npm run db:seed:reset` | **Borra todos los datos** y vuelve a cargar el demo |
| `npm run db:studio` | Abre Prisma Studio (explorar BD) |

### Endpoints principales

| Método | Ruta | Uso |
|--------|------|-----|
| GET | `/api/health` | Verificar que la API está activa |
| GET | `/api/products` | Listado (query: `categorySlug`, `page`, `limit`) |
| GET | `/api/products/:id` | Detalle con imágenes y atributos EAV |
| GET | `/api/categories` | Árbol de categorías |
| POST | `/api/orders` | Crear pedido (estado inicial: pendiente) |
| GET | `/api/orders` | Listar pedidos (`status`, `search`, paginación) |
| PATCH | `/api/orders/:id/status` | Cambiar estado del pedido |

Documentación ampliada: [node-ecommerce/README.md](node-ecommerce/README.md)

---

## Proyecto: `angular-ecommerce-main` (Frontend)

### Qué hace

Interfaz web **SportShop** para comprar artículos deportivos:

- Catálogo de productos desde el backend (ya no usa Fake Store API).
- Filtro por categoría desde el menú (Fútbol, Running, Gym, Natación, Outdoor, Calzado).
- Carrito en `localStorage`.
- Checkout con formulario de datos del cliente y registro del pedido en el backend.
- Página de confirmación con número de pedido (`PED-2026-00001`, etc.).

### Estructura principal

```
angular-ecommerce-main/
├── src/
│   ├── app/
│   │   ├── home/              # Listado de productos
│   │   ├── product/           # Detalle de producto
│   │   ├── cart/              # Carrito
│   │   ├── checkout/          # Formulario de pedido
│   │   ├── payment/           # Confirmación
│   │   ├── core/services/     # ProductApiService, OrderService, etc.
│   │   └── shared/            # Navbar, modelos, componentes
│   └── environments/
│       └── environment.ts     # URL del backend
└── public/                    # Imágenes estáticas
```

### Rutas de la aplicación

| Ruta | Pantalla |
|------|----------|
| `/` | Inicio (todos los productos o `?category=futbol`, etc.) |
| `/products/:id` | Detalle de producto |
| `/cart` | Carrito |
| `/checkout` | Datos del cliente y confirmación de pedido |
| `/admin/productos` | Panel para agregar, editar y eliminar productos (con carga de imágenes) |
| `/admin/pedidos` | Visor de pedidos: filtrar y cambiar estado (pendiente / en proceso / atendido) |
| `/PaymentSuccess` | Pedido registrado |

### Scripts útiles

| Comando | Descripción |
|---------|-------------|
| `npm start` | Servidor de desarrollo (`ng serve`) en el puerto del `.env` |
| `npm run build` | Build de producción en `dist/amazon-frontend/browser` |
| `npm run start:prod` | Sirve el build con `server.js` (PM2) |
| `npm run serve:prod` | Build + start:prod |
| `npm test` | Tests unitarios (Karma) |

---

## Flujo de compra (end-to-end)

1. Usuario navega por categorías o ve todos los productos en el inicio.
2. Agrega productos al carrito.
3. En **Carrito** → **Ir al checkout**.
4. Completa nombre, documento (DNI/RUC), teléfono, provincia, país y dirección de despacho.
5. El frontend envía `POST /api/orders` al backend.
6. Se abre WhatsApp con el detalle del pedido hacia el número configurado en Admin.
7. Se muestra la confirmación con el número de pedido en estado **pendiente**.

El número de WhatsApp se edita en **Admin → WhatsApp de pedidos** (`/admin/productos`).

El **carrito** se guarda en PostgreSQL (`carts` / `cart_items`). Al agregar un producto se persiste de inmediato en la BD; la página `/cart` solo lista esos ítems. El ícono del carrito en el catálogo se pone verde cuando el producto ya está en el carrito.

---

## Solución de problemas

| Problema | Posible causa | Qué hacer |
|----------|---------------|-----------|
| El frontend no muestra productos | Backend apagado o BD vacía | Ejecuta `npm run dev` y `npm run db:seed` en `node-ecommerce` |
| Error CORS en el navegador | `CORS_ORIGIN` incorrecto | En `.env` del backend usa `http://localhost:4900` |
| Error al conectar a PostgreSQL | BD no creada o URL incorrecta | Revisa `DATABASE_URL` o usa `docker compose up -d` |
| `prisma generate` falla por SSL | Proxy/certificados corporativos | Usa `$env:NODE_TLS_REJECT_UNAUTHORIZED=0` antes de `npx prisma generate` |
| Checkout devuelve error 500 | Migraciones no aplicadas | Ejecuta `npm run db:migrate` en `node-ecommerce` |
| Se borraron productos/pedidos | Se usó `db:seed:reset` o un seed antiguo destructivo | Evita `db:seed:reset`; `db:migrate` y `db:seed` ya no limpian la BD |

---

## Orden de arranque rápido (resumen)

```powershell
# Terminal 1 — Backend
cd node-ecommerce
docker compose up -d          # solo si usas Docker
npm run dev

# Terminal 2 — Frontend
cd angular-ecommerce-main
npm start
```

---

## Licencia

Proyecto de uso educativo / propio. Ajusta la licencia según tus necesidades.
