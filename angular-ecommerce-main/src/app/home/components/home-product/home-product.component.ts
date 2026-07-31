import { Component, computed, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { FavoritesService } from '../../../core/services/favorites.service';
import { Product } from '../../../shared/models/product';
import { SolCurrencyPipe } from '../../../shared/pipes/sol-currency.pipe';

@Component({
  selector: 'app-home-product',
  imports: [SolCurrencyPipe, RouterLink],
  templateUrl: './home-product.component.html',
})
export class HomeProductComponent {
  private readonly favoritesService = inject(FavoritesService);

  product = input.required<Product>();

  private readonly favoriteIds = toSignal(this.favoritesService.ids$, {
    initialValue: new Set<string>(),
  });

  readonly isFavorite = computed(() =>
    this.favoriteIds().has(this.product().id),
  );

  ratePercent = computed(() => {
    const rate = this.product().ratingRate ?? 0;
    return Math.max(0, Math.min(100, (rate / 5) * 100));
  });

  discountPercent = computed(() => {
    const product = this.product();
    const previous = product.previousPrice;
    if (!previous || previous <= product.price) return 0;
    return Math.round(((previous - product.price) / previous) * 100);
  });

  toggleFavorite(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.favoritesService.toggle(this.product());
  }
}
