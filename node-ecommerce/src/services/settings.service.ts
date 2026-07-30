import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/error-handler';

export const WHATSAPP_KEY = 'whatsapp_number';

const updateWhatsappSchema = z.object({
  whatsappNumber: z
    .string()
    .min(8, 'Número demasiado corto')
    .max(20)
    .regex(/^[0-9]+$/, 'Solo dígitos con código de país, sin + ni espacios'),
});

function normalizeWhatsapp(value: string): string {
  return value.replace(/\D/g, '');
}

export async function getWhatsappSetting() {
  const setting = await prisma.storeSetting.findUnique({
    where: { key: WHATSAPP_KEY },
  });

  return {
    whatsappNumber: setting?.value ?? '',
    updatedAt: setting?.updatedAt ?? null,
  };
}

export async function updateWhatsappSetting(data: unknown) {
  const parsed = updateWhatsappSchema.parse(data);
  const value = normalizeWhatsapp(parsed.whatsappNumber);

  if (value.length < 8) {
    throw new AppError(400, 'Número de WhatsApp inválido');
  }

  const setting = await prisma.storeSetting.upsert({
    where: { key: WHATSAPP_KEY },
    create: { key: WHATSAPP_KEY, value },
    update: { value },
  });

  return {
    whatsappNumber: setting.value,
    updatedAt: setting.updatedAt,
  };
}
