import { OrderResponse } from '../models/create-order';
import { CreateOrderDto } from '../models/create-order';
import { CartProduct } from '../models/cart-product';

/** Arma el texto del pedido para WhatsApp */
export function buildWhatsappOrderMessage(
  order: OrderResponse,
  dto: CreateOrderDto,
  cartProducts: CartProduct[],
): string {
  const lines: string[] = [
    `*Nuevo pedido ${order.orderNumber}*`,
    '',
    `*Cliente:* ${dto.clientName}`,
    `*Tel:* ${dto.phoneNumber}`,
    `*${dto.documentType}:* ${dto.documentNumber}`,
    `*Ubicación:* ${dto.province}, ${dto.country}`,
    `*Despacho:* ${dto.shippingAddress}`,
  ];

  if (dto.notes?.trim()) {
    lines.push(`*Notas:* ${dto.notes.trim()}`);
  }

  lines.push('', '*Detalle:*');

  for (const item of cartProducts) {
    const lineTotal = item.product.price * item.quantity;
    lines.push(
      `- ${item.product.name} x${item.quantity} — S/ ${lineTotal.toFixed(2)}`,
    );
  }

  const subtotal = cartProducts.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );
  const shipping = dto.shippingCost ?? 0;
  const total = order.total ?? subtotal + shipping;

  lines.push(
    '',
    `Subtotal: S/ ${subtotal.toFixed(2)}`,
    `Envío: S/ ${shipping.toFixed(2)}`,
    `*Total: S/ ${Number(total).toFixed(2)}*`,
    '',
    `_Estado: ${order.status}_`,
  );

  return lines.join('\n');
}

/** Solo dígitos del número WhatsApp */
export function whatsappDigits(whatsappNumber: string): string {
  return (whatsappNumber ?? '').replace(/\D/g, '');
}

/** Formatea para mostrar: 51999888777 → +51 999 888 777 */
export function formatWhatsappDisplay(whatsappNumber: string): string {
  const digits = whatsappDigits(whatsappNumber);
  if (!digits) return '';

  if (digits.startsWith('51') && digits.length >= 11) {
    const rest = digits.slice(2);
    const groups = rest.match(/.{1,3}/g) ?? [rest];
    return `+51 ${groups.join(' ')}`;
  }

  if (digits.length >= 9) {
    const groups = digits.match(/.{1,3}/g) ?? [digits];
    return `+${groups.join(' ')}`;
  }

  return `+${digits}`;
}

/** Link directo a chat WhatsApp */
export function whatsappChatUrl(
  whatsappNumber: string,
  message = '',
): string {
  const digits = whatsappDigits(whatsappNumber);
  if (!digits) return '';
  const base = `https://wa.me/${digits}`;
  return message
    ? `${base}?text=${encodeURIComponent(message)}`
    : base;
}

/** Abre WhatsApp Web/App con el mensaje prellenado */
export function openWhatsappOrder(
  whatsappNumber: string,
  message: string,
): void {
  const url = whatsappChatUrl(whatsappNumber, message);
  if (!url) return;
  window.open(url, '_blank', 'noopener,noreferrer');
}
