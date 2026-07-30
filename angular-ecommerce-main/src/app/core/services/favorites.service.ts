import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { Product } from '../../shared/models/product';

const STORAGE_KEY = 'alaba_favorites';

export interface FavoriteProduct {
  id: string;
  name: string;
  urlImg: string;
  price: number;
  previousPrice: number | null;
  categoryName?: string;
  category?: string;
  inStock: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class FavoritesService {
  private readonly itemsSubject = new BehaviorSubject<FavoriteProduct[]>(
    this.readStorage(),
  );
  private readonly idsSubject = new BehaviorSubject<Set<string>>(
    new Set(this.itemsSubject.value.map((p) => p.id)),
  );

  readonly items$ = this.itemsSubject.asObservable();
  readonly ids$ = this.idsSubject.asObservable();
  readonly count$ = this.items$.pipe(map((items) => items.length));

  get items(): FavoriteProduct[] {
    return this.itemsSubject.value;
  }

  get count(): number {
    return this.items.length;
  }

  isFavorite(productId: string): boolean {
    return this.idsSubject.value.has(productId);
  }

  toggle(product: Product | FavoriteProduct): boolean {
    if (this.isFavorite(product.id)) {
      this.remove(product.id);
      return false;
    }
    this.add(product);
    return true;
  }

  add(product: Product | FavoriteProduct): void {
    if (this.isFavorite(product.id)) return;

    const entry: FavoriteProduct = {
      id: product.id,
      name: product.name,
      urlImg: product.urlImg,
      price: product.price,
      previousPrice: product.previousPrice ?? null,
      categoryName: 'categoryName' in product ? product.categoryName : undefined,
      category: 'category' in product ? product.category : undefined,
      inStock: product.inStock,
    };

    const next = [entry, ...this.items];
    this.persist(next);
  }

  remove(productId: string): void {
    const next = this.items.filter((p) => p.id !== productId);
    this.persist(next);
  }

  clear(): void {
    this.persist([]);
  }

  private persist(items: FavoriteProduct[]): void {
    this.itemsSubject.next(items);
    this.idsSubject.next(new Set(items.map((p) => p.id)));
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore quota / private mode
    }
  }

  private readStorage(): FavoriteProduct[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as FavoriteProduct[];
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(
        (p) =>
          !!p?.id &&
          typeof p.name === 'string' &&
          typeof p.urlImg === 'string' &&
          typeof p.price === 'number',
      );
    } catch {
      return [];
    }
  }
}
