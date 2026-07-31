"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WHATSAPP_KEY = void 0;
exports.getWhatsappSetting = getWhatsappSetting;
exports.updateWhatsappSetting = updateWhatsappSetting;
const zod_1 = require("zod");
const prisma_1 = require("../lib/prisma");
const error_handler_1 = require("../middleware/error-handler");
exports.WHATSAPP_KEY = 'whatsapp_number';
const updateWhatsappSchema = zod_1.z.object({
    whatsappNumber: zod_1.z
        .string()
        .min(8, 'Número demasiado corto')
        .max(20)
        .regex(/^[0-9]+$/, 'Solo dígitos con código de país, sin + ni espacios'),
});
function normalizeWhatsapp(value) {
    return value.replace(/\D/g, '');
}
async function getWhatsappSetting() {
    const setting = await prisma_1.prisma.storeSetting.findUnique({
        where: { key: exports.WHATSAPP_KEY },
    });
    return {
        whatsappNumber: setting?.value ?? '',
        updatedAt: setting?.updatedAt ?? null,
    };
}
async function updateWhatsappSetting(data) {
    const parsed = updateWhatsappSchema.parse(data);
    const value = normalizeWhatsapp(parsed.whatsappNumber);
    if (value.length < 8) {
        throw new error_handler_1.AppError(400, 'Número de WhatsApp inválido');
    }
    const setting = await prisma_1.prisma.storeSetting.upsert({
        where: { key: exports.WHATSAPP_KEY },
        create: { key: exports.WHATSAPP_KEY, value },
        update: { value },
    });
    return {
        whatsappNumber: setting.value,
        updatedAt: setting.updatedAt,
    };
}
//# sourceMappingURL=settings.service.js.map