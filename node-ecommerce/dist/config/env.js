"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publicDir = exports.env = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const dotenv_1 = require("dotenv");
const zod_1 = require("zod");
/**
 * Busca el .env central del monorepo (raíz) y, si no está, el de node-ecommerce.
 * Orden:
 * 1) process.cwd()/../.env     (cwd = node-ecommerce)
 * 2) process.cwd()/.env        (cwd = raíz o node-ecommerce generado)
 */
function resolveEnvPath() {
    const candidates = [
        (0, path_1.resolve)(process.cwd(), '../.env'),
        (0, path_1.resolve)(process.cwd(), '.env'),
    ];
    for (const path of candidates) {
        if ((0, fs_1.existsSync)(path))
            return path;
    }
    return candidates[0];
}
const envPath = resolveEnvPath();
if (!(0, fs_1.existsSync)(envPath)) {
    console.error('\n❌ No se encontró el archivo .env\n' +
        '   En la raíz del monorepo (Ecomerce2026/):\n' +
        '   cp .env.example .env\n' +
        '   npm run sync-env\n');
}
(0, dotenv_1.config)({ path: envPath });
// También carga el .env local del backend si existe (generado por sync-env)
const localEnv = (0, path_1.resolve)(process.cwd(), '.env');
if (localEnv !== envPath && (0, fs_1.existsSync)(localEnv)) {
    (0, dotenv_1.config)({ path: localEnv, override: false });
}
const envSchema = zod_1.z.object({
    DATABASE_URL: zod_1.z.string().min(1, 'DATABASE_URL es obligatoria en .env'),
    PORT: zod_1.z.coerce.number().default(3900),
    CORS_ORIGIN: zod_1.z.string().default('http://localhost:4900'),
    /** Base pública del API (para URLs de imágenes estáticas) */
    PUBLIC_BASE_URL: zod_1.z.string().default('http://localhost:3900'),
    JWT_SECRET: zod_1.z
        .string()
        .min(16, 'JWT_SECRET debe tener al menos 16 caracteres')
        .default('alaba-sport-dev-secret-change-me'),
    JWT_EXPIRES_IN: zod_1.z.string().default('8h'),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    console.error('\n❌ Variables de entorno inválidas:');
    for (const issue of parsed.error.issues) {
        console.error(`   - ${issue.path.join('.')}: ${issue.message}`);
    }
    console.error('\n   Edita Ecomerce2026/.env y ejecuta: npm run sync-env\n');
    process.exit(1);
}
exports.env = parsed.data;
/** Carpeta física de archivos públicos (imágenes, etc.) */
exports.publicDir = (0, path_1.resolve)(process.cwd(), 'public');
//# sourceMappingURL=env.js.map