import { AppError } from '../middleware/error-handler';
import { OrderStatusType } from '../types/order-status';

const STATUS_ORDER: OrderStatusType[] = [
  'pendiente',
  'en_proceso',
  'atendido',
];

const ALLOWED_TRANSITIONS: Record<OrderStatusType, OrderStatusType[]> = {
  pendiente: ['en_proceso', 'atendido'],
  en_proceso: ['atendido', 'pendiente'],
  atendido: ['en_proceso', 'pendiente'],
};

function isBackward(from: OrderStatusType, to: OrderStatusType): boolean {
  return STATUS_ORDER.indexOf(to) < STATUS_ORDER.indexOf(from);
}

export function validateStatusTransition(
  from: OrderStatusType,
  to: OrderStatusType,
  reason?: string,
): void {
  if (from === to) {
    throw new AppError(400, 'El pedido ya se encuentra en ese estado');
  }

  const allowed = ALLOWED_TRANSITIONS[from];
  if (!allowed.includes(to)) {
    throw new AppError(
      400,
      `Transición no permitida de "${from}" a "${to}"`,
    );
  }

  if (isBackward(from, to) && (!reason || reason.trim().length === 0)) {
    throw new AppError(
      400,
      'Se requiere un motivo (reason) para retroceder el estado del pedido',
    );
  }
}

export const ORDER_STATUS_LABELS: Record<OrderStatusType, string> = {
  pendiente: 'Pendiente',
  en_proceso: 'En proceso',
  atendido: 'Atendido',
};
