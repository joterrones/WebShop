import { Product } from './product';

export interface CartProduct {
  /** ID del ítem en el carrito (línea producto+talla) */
  id: string;
  product: Product;
  quantity: number;
  talla: string;
}

/** Tallas disponibles en el detalle de producto */
export const AVAILABLE_TALLAS = [
  '8',
  '10',
  '12',
  'XS',
  'S',
  'M',
  'L',
  'XL',
] as const;

export type AvailableTalla = (typeof AVAILABLE_TALLAS)[number];
