import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, input, OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { FavoritesService } from '../../../core/services/favorites.service';
import { Product } from '../../../shared/models/product';

@Component({
  selector: 'app-home-product',
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './home-product.component.html',
})
export class HomeProductComponent implements OnInit {
  private readonly cartService = inject(CartService);
  private readonly favoritesService = inject(FavoritesService);

  product = input.required<Product>();
  adding = false;

  private readonly productIds = toSignal(this.cartService.productIds$, {
    initialValue: new Set<string>(),
  });

  private readonly favoriteIds = toSignal(this.favoritesService.ids$, {
    initialValue: new Set<string>(),
  });

  readonly inCart = computed(() =>
    this.productIds().has(this.product().id),
  );

  readonly isFavorite = computed(() =>
    this.favoriteIds().has(this.product().id),
  );

  ratePercent = computed(() => {
    const rate = this.product().ratingRate ?? 0;
    return Math.max(0, Math.min(100, (rate / 5) * 100));
  });

  ngOnInit(): void {
    this.cartService.ensureLoaded();
  }

  addToCart(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    const product = this.product();
    if (!product.inStock || this.adding) return;

    this.adding = true;
    this.cartService.addProduct(product, 1, 'M').subscribe({
      next: () => {
        this.adding = false;
      },
      error: () => {
        this.adding = false;
      },
    });
  }

  toggleFavorite(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.favoritesService.toggle(this.product());
  }
}
