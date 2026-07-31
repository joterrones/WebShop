export type OrderStatus = 'pendiente' | 'en_proceso' | 'atendido';

export interface OrderItemAttribute {
  attributeCode: string;
  attributeName: string;
  value: string;
}

export interface OrderItem {
  id: string;
  productId: string | null;
  productName: string;
  description: string;
  talla: string;
  tipoTela: string;
  quantity: number;
  unitPrice: number;
  lineDiscount: number;
  lineTotal: number;
  attributes: OrderItemAttribute[];
}

export interface OrderStatusHistoryEntry {
  id: string;
  fromStatus: OrderStatus | null;
  toStatus: OrderStatus;
  reason: string | null;
  changedAt: string;
  changedBy: string | null;
}

export interface OrderPriceAdjustment {
  id: string;
  orderItemId: string | null;
  adjustmentType: 'discount_percent' | 'discount_fixed' | 'price_override';
  value: number;
  reason: string;
  appliedAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  clientName: string;
  phoneNumber: string;
  province: string;
  country: string;
  shippingAddress: string;
  documentType: 'DNI' | 'RUC';
  documentNumber: string;
  subtotal: number;
  discountTotal: number;
  shippingCost: number;
  total: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  statusHistory: OrderStatusHistoryEntry[];
  adjustments?: OrderPriceAdjustment[];
}

export interface OrdersListResponse {
  data: Order[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UpdateOrderStatusDto {
  toStatus: OrderStatus;
  reason?: string;
  changedBy?: string;
}

export interface SetOrderDiscountDto {
  amount: number;
  reason: string;
}

export interface UpdateOrderShippingDto {
  shippingCost: number;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pendiente: 'Pendiente',
  en_proceso: 'En proceso',
  atendido: 'Atendido',
};

export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pendiente: ['en_proceso', 'atendido'],
  en_proceso: ['atendido', 'pendiente'],
  atendido: ['en_proceso', 'pendiente'],
};
