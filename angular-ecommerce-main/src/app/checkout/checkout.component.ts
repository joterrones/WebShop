import { CurrencyPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CartProduct } from '../shared/models/cart-product';
import {
  CreateOrderDto,
  CreateOrderItem,
  DocumentType,
  OrderResponse,
} from '../shared/models/create-order';
import { ProductAttributes } from '../shared/models/product';
import { OrderService } from '../core/services/order.service';
import { CartService } from '../core/services/cart.service';
import { SettingsService } from '../core/services/settings.service';
import {
  buildWhatsappOrderMessage,
  openWhatsappOrder,
} from '../shared/utils/whatsapp.util';

const ATTRIBUTE_LABELS: Record<string, string> = {
  talla: 'Talla',
  tipo_tela: 'Tipo de tela',
  color: 'Color',
  marca: 'Marca',
};

@Component({
  selector: 'app-checkout',
  imports: [ReactiveFormsModule, CurrencyPipe],
  templateUrl: './checkout.component.html',
})
export class CheckoutComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly orderService = inject(OrderService);
  private readonly cartService = inject(CartService);
  private readonly settingsService = inject(SettingsService);
  private readonly router = inject(Router);

  cartProducts: CartProduct[] = [];
  subtotal = 0;
  shippingCost = 15;
  isSubmitting = false;
  errorMessage = '';

  readonly form = this.fb.nonNullable.group({
    clientName: ['', Validators.required],
    phoneNumber: ['', Validators.required],
    province: ['', Validators.required],
    country: ['Perú', Validators.required],
    shippingAddress: ['', Validators.required],
    documentType: ['DNI' as DocumentType, Validators.required],
    documentNumber: ['', Validators.required],
    notes: [''],
  });

  ngOnInit(): void {
    this.cartService.loadCart().subscribe({
      next: (items) => {
        this.cartProducts = items;
        if (this.cartProducts.length === 0) {
          this.router.navigate(['/cart']);
          return;
        }
        this.subtotal = this.cartService.total;
      },
      error: () => {
        this.router.navigate(['/cart']);
      },
    });
  }

  get total(): number {
    return this.subtotal + this.shippingCost;
  }

  submit(): void {
    if (this.form.invalid || this.isSubmitting) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const dto: CreateOrderDto = {
      ...this.form.getRawValue(),
      shippingCost: this.shippingCost,
      items: this.cartProducts.map((item) => this.mapCartItemToOrderItem(item)),
    };

    const cartSnapshot = [...this.cartProducts];

    forkJoin({
      order: this.orderService.createOrder(dto),
      whatsapp: this.settingsService.getWhatsapp(),
    }).subscribe({
      next: ({ order, whatsapp }) => {
        this.sendToWhatsapp(order, dto, cartSnapshot, whatsapp.whatsappNumber);
        this.cartService.clear().subscribe({
          next: () => {
            this.router.navigate(['/PaymentSuccess'], {
              queryParams: {
                orderNumber: order.orderNumber,
                whatsapp: whatsapp.whatsappNumber ? '1' : '0',
              },
            });
          },
          error: () => {
            this.router.navigate(['/PaymentSuccess'], {
              queryParams: {
                orderNumber: order.orderNumber,
                whatsapp: whatsapp.whatsappNumber ? '1' : '0',
              },
            });
          },
        });
      },
      error: () => {
        this.isSubmitting = false;
        this.errorMessage =
          'No se pudo registrar el pedido. Verifica que el backend esté activo.';
      },
    });
  }

  private sendToWhatsapp(
    order: OrderResponse,
    dto: CreateOrderDto,
    cartProducts: CartProduct[],
    whatsappNumber: string,
  ): void {
    if (!whatsappNumber) return;

    const message = buildWhatsappOrderMessage(order, dto, cartProducts);
    openWhatsappOrder(whatsappNumber, message);
  }

  private mapCartItemToOrderItem(cartProduct: CartProduct): CreateOrderItem {
    const { product, quantity, talla } = cartProduct;
    const attrs = { ...(product.attributes ?? {}), talla };

    return {
      productId: product.id,
      productName: product.name,
      description: product.description,
      talla,
      tipoTela: attrs.tipo_tela ?? 'N/A',
      quantity,
      unitPrice: product.price,
      lineDiscount: 0,
      attributes: this.mapAttributes(attrs),
    };
  }

  private mapAttributes(attrs: ProductAttributes) {
    return Object.entries(attrs)
      .filter(([, value]) => !!value)
      .map(([code, value]) => ({
        attributeCode: code,
        attributeName: ATTRIBUTE_LABELS[code] ?? code,
        value: value as string,
      }));
  }
}
