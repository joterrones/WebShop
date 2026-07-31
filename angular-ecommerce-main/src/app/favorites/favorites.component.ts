import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  FavoriteProduct,
  FavoritesService,
} from '../core/services/favorites.service';
import { SolCurrencyPipe } from '../shared/pipes/sol-currency.pipe';

@Component({
  selector: 'app-favorites',
  imports: [AsyncPipe, SolCurrencyPipe, RouterLink],
  templateUrl: './favorites.component.html',
})
export class FavoritesComponent {
  private readonly favorites = inject(FavoritesService);

  readonly items$ = this.favorites.items$;
  readonly count$ = this.favorites.count$;

  remove(productId: string, event?: Event): void {
    event?.preventDefault();
    event?.stopPropagation();
    this.favorites.remove(productId);
  }

  clearAll(): void {
    this.favorites.clear();
  }

  categoryLabel(item: FavoriteProduct): string {
    return item.categoryName ?? item.category ?? '';
  }
}
