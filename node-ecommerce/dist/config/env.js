"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publicDir = exports.env = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const dotenv_1 = require("dotenv");
const zod_1 = require("zod");
const envPath = (0, path_1.resolve)(process.cwd(), '.env');
if (!(0, fs_1.existsSync)(envPath)) {
    console.error('\n❌ No se encontró el archivo .env\n' +
        '   Copia .env.example y configura DATABASE_URL:\n' +
        '   copy .env.example .env\n');
}
(0, dotenv_1.config)({ path: envPath });
const envSchema = zod_1.z.object({
    DATABASE_URL: zod_1.z.string().min(1, 'DATABASE_URL es obligatoria en .env'),
    PORT: zod_1.z.coerce.number().default(3000),
    CORS_ORIGIN: zod_1.z.string().default('http://localhost:4900'),
    /** Base pública del API (para URLs de imágenes estáticas) */
    PUBLIC_BASE_URL: zod_1.z.string().default('http://localhost:3900'),
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
exports.env = parsed.data;
/** Carpeta física de archivos públicos (imágenes, etc.) */
exports.publicDir = (0, path_1.resolve)(process.cwd(), 'public');
//# sourceMappingURL=env.js.map