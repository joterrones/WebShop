import { CurrencyPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CartProductComponent } from './components/cart-product/cart-product.component';
import { CartService } from '../core/services/cart.service';
import { CartProduct } from '../shared/models/cart-product';

@Component({
  selector: 'app-cart',
  imports: [CartProductComponent, CurrencyPipe, RouterLink],
  templateUrl: './cart.component.html',
})
export class CartComponent implements OnInit {
  private readonly cartService = inject(CartService);
  private readonly router = inject(Router);

  cartProducts: CartProduct[] = [];
  total = 0;
  loading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.refresh();
  }

  goToCheckout(): void {
    if (this.cartProducts.length === 0) return;
    this.router.navigate(['/checkout']);
  }

  refresh(): void {
    this.loading = true;
    this.errorMessage = '';
    this.cartService.loadCart().subscribe({
      next: (items) => {
        this.cartProducts = items;
        this.total = this.cartService.total;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.cartProducts = [];
        this.total = 0;
        this.errorMessage =
          'No se pudo cargar el carrito desde la base de datos.';
      },
    });
  }
}
