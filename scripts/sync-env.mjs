/**
 * Sincroniza el .env de la raíz del monorepo hacia:
 * - node-ecommerce/.env          (Prisma / scripts del backend)
 * - angular environments         (apiUrl / mediaBaseUrl)
 * - angular package.json start   (puerto)
 *
 * Uso: npm run sync-env  (desde la raíz Ecomerce2026)
 */
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const rootDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const envPath = join(rootDir, '.env');

function parseEnv(content) {
  /** @type {Record<string, string>} */
  const out = {};
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

function requireKeys(env, keys) {
  const missing = keys.filter((k) => !env[k]);
  if (missing.length) {
    console.error(`❌ Faltan variables en .env: ${missing.join(', ')}`);
    process.exit(1);
  }
}

if (!existsSync(envPath)) {
  console.error(
    '\n❌ No se encontró .env en la raíz del monorepo.\n' +
      '   cp .env.example .env\n' +
      '   Luego edita .env y vuelve a ejecutar: npm run sync-env\n',
  );
  process.exit(1);
}

const env = parseEnv(readFileSync(envPath, 'utf8'));

requireKeys(env, [
  'DATABASE_URL',
  'PORT',
  'CORS_ORIGIN',
  'PUBLIC_BASE_URL',
  'JWT_SECRET',
  'API_URL',
  'MEDIA_BASE_URL',
  'ANGULAR_PORT',
]);

const jwtExpires = env.JWT_EXPIRES_IN || '8h';

// --- Backend .env (Prisma busca .env en node-ecommerce/) ---
const backendEnv = `# Generado automáticamente desde el .env de la raíz.
# No edites este archivo a mano. Edita Ecomerce2026/.env y ejecuta: npm run sync-env

DATABASE_URL=${env.DATABASE_URL}
PORT=${env.PORT}
CORS_ORIGIN=${env.CORS_ORIGIN}
PUBLIC_BASE_URL=${env.PUBLIC_BASE_URL}
JWT_SECRET=${env.JWT_SECRET}
JWT_EXPIRES_IN=${jwtExpires}
`;

writeFileSync(join(rootDir, 'node-ecommerce', '.env'), backendEnv, 'utf8');
console.log('✓ node-ecommerce/.env');

// --- Angular environments ---
const apiUrl = env.API_URL.replace(/\/$/, '');
const mediaBaseUrl = env.MEDIA_BASE_URL.replace(/\/$/, '');

const envDev = `export const environment = {
  production: false,
  apiUrl: '${apiUrl}',
  /** Origen del backend que publica public/images (sin /api) */
  mediaBaseUrl: '${mediaBaseUrl}',
};
`;

const envProd = `export const environment = {
  production: true,
  apiUrl: '${apiUrl}',
  mediaBaseUrl: '${mediaBaseUrl}',
};
`;

const angularEnvDir = join(
  rootDir,
  'angular-ecommerce-main',
  'src',
  'environments',
);
writeFileSync(join(angularEnvDir, 'environment.ts'), envDev, 'utf8');
writeFileSync(join(angularEnvDir, 'environment.prod.ts'), envProd, 'utf8');
console.log('✓ angular-ecommerce-main/src/environments/environment.ts');
console.log('✓ angular-ecommerce-main/src/environments/environment.prod.ts');

// --- Angular start port ---
const angularPkgPath = join(rootDir, 'angular-ecommerce-main', 'package.json');
const angularPkg = JSON.parse(readFileSync(angularPkgPath, 'utf8'));
angularPkg.scripts = angularPkg.scripts || {};
angularPkg.scripts.start = `ng serve --port ${env.ANGULAR_PORT}`;
writeFileSync(
  angularPkgPath,
  `${JSON.stringify(angularPkg, null, 2)}\n`,
  'utf8',
);
console.log(`✓ angular start → puerto ${env.ANGULAR_PORT}`);

console.log('\nListo. Configuración central: Ecomerce2026/.env\n');
