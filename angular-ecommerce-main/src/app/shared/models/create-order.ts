export type DocumentType = 'DNI' | 'RUC';

export interface CreateOrderItemAttribute {
  attributeCode: string;
  attributeName: string;
  value: string;
}

export interface CreateOrderItem {
  productId?: string;
  productName: string;
  description: string;
  talla: string;
  tipoTela: string;
  quantity: number;
  unitPrice: number;
  lineDiscount?: number;
  attributes?: CreateOrderItemAttribute[];
}

export interface CreateOrderDto {
  clientName: string;
  phoneNumber: string;
  province: string;
  country: string;
  shippingAddress: string;
  documentType: DocumentType;
  documentNumber: string;
  shippingCost?: number;
  notes?: string;
  items: CreateOrderItem[];
}

export interface OrderResponse {
  id: string;
  orderNumber: string;
  status: string;
  clientName: string;
  total: number;
  subtotal: number;
  discountTotal: number;
  shippingCost: number;
}
