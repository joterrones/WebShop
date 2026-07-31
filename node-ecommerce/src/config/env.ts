import { existsSync } from 'fs';
import { resolve } from 'path';
import { config } from 'dotenv';
import { z } from 'zod';

/**
 * Busca el .env central del monorepo (raíz) y, si no está, el de node-ecommerce.
 * Orden:
 * 1) process.cwd()/../.env     (cwd = node-ecommerce)
 * 2) process.cwd()/.env        (cwd = raíz o node-ecommerce generado)
 */
function resolveEnvPath(): string {
  const candidates = [
    resolve(process.cwd(), '../.env'),
    resolve(process.cwd(), '.env'),
  ];

  for (const path of candidates) {
    if (existsSync(path)) return path;
  }

  return candidates[0];
}

const envPath = resolveEnvPath();

if (!existsSync(envPath)) {
  console.error(
    '\n❌ No se encontró el archivo .env\n' +
      '   En la raíz del monorepo (Ecomerce2026/):\n' +
      '   cp .env.example .env\n' +
      '   npm run sync-env\n',
  );
}

config({ path: envPath });
// También carga el .env local del backend si existe (generado por sync-env)
const localEnv = resolve(process.cwd(), '.env');
if (localEnv !== envPath && existsSync(localEnv)) {
  config({ path: localEnv, override: false });
}

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL es obligatoria en .env'),
  PORT: z.coerce.number().default(3900),
  CORS_ORIGIN: z.string().default('http://localhost:4900'),
  /** Base pública del API (para URLs de imágenes estáticas) */
  PUBLIC_BASE_URL: z.string().default('http://localhost:3900'),
  JWT_SECRET: z
    .string()
    .min(16, 'JWT_SECRET debe tener al menos 16 caracteres')
    .default('alaba-sport-dev-secret-change-me'),
  JWT_EXPIRES_IN: z.string().default('8h'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('\n❌ Variables de entorno inválidas:');
  for (const issue of parsed.error.issues) {
    console.error(`   - ${issue.path.join('.')}: ${issue.message}`);
  }
  console.error(
    '\n   Edita Ecomerce2026/.env y ejecuta: npm run sync-env\n',
  );
  process.exit(1);
}

export const env = parsed.data;

/** Carpeta física de archivos públicos (imágenes, etc.) */
export const publicDir = resolve(process.cwd(), 'public');
