import { existsSync } from 'fs';
import { resolve } from 'path';
import { config } from 'dotenv';
import { z } from 'zod';

const envPath = resolve(process.cwd(), '.env');

if (!existsSync(envPath)) {
  console.error(
    '\n❌ No se encontró el archivo .env\n' +
      '   Copia .env.example y configura DATABASE_URL:\n' +
      '   copy .env.example .env\n',
  );
}

config({ path: envPath });

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
  console.error('\n   Revisa el archivo .env en node-ecommerce/\n');
  process.exit(1);
}

export const env = parsed.data;

/** Carpeta física de archivos públicos (imágenes, etc.) */
export const publicDir = resolve(process.cwd(), 'public');
