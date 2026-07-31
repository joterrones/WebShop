import { Component, inject, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { CartProduct } from '../../../shared/models/cart-product';
import { SolCurrencyPipe } from '../../../shared/pipes/sol-currency.pipe';

@Component({
  selector: 'app-cart-product',
  imports: [SolCurrencyPipe, RouterLink],
  templateUrl: './cart-product.component.html',
})
export class CartProductComponent {
  private readonly cartService = inject(CartService);

  cartProduct = input.required<CartProduct>();
  updateCartEvent = output<void>();

  get lineTotal(): number {
    const item = this.cartProduct();
    return item.product.price * item.quantity;
  }

  increase(): void {
    this.cartService.increase(this.cartProduct().id).subscribe({
      next: () => this.updateCartEvent.emit(),
    });
  }

  decrease(): void {
    this.cartService.decrease(this.cartProduct().id).subscribe({
      next: () => this.updateCartEvent.emit(),
    });
  }

  removeProduct(): void {
    this.cartService.removeItem(this.cartProduct().id).subscribe({
      next: () => this.updateCartEvent.emit(),
    });
  }
}
