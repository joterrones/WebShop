import { Injectable, inject } from '@angular/core';
import { Product } from '../../shared/models/product';
import { Observable, map, of } from 'rxjs';
import { ListProductsParams, ProductApiService } from './product-api.service';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly productApiService = inject(ProductApiService);
  private readonly cache = new Map<string, Product[]>();

  getAll(categorySlugOrParams?: string | ListProductsParams): Observable<Product[]> {
    const params: ListProductsParams =
      typeof categorySlugOrParams === 'string' ||
      categorySlugOrParams === undefined
        ? { categorySlug: categorySlugOrParams }
        : categorySlugOrParams;

    const cacheKey = [
      params.categorySlug ?? '__all__',
      params.search?.trim() ?? '',
      params.categoryId ?? '',
      params.showInBanner === undefined ? '' : String(params.showInBanner),
      params.isActive === undefined ? '' : String(params.isActive),
      params.includeInactive ? '1' : '0',
    ].join('|');

    const cached = this.cache.get(cacheKey);
    if (cached) {
      return of(cached);
    }

    return this.productApiService.getProducts(params).pipe(
      map((products) => {
        this.cache.set(cacheKey, products);
        return products;
      }),
    );
  }

  getOffers(): Observable<Product[]> {
    const numberOfOffers = 5;
    return this.getAll().pipe(
      map((products) =>
        products
          .filter((p) => p.previousPrice !== null)
          .slice(0, numberOfOffers),
      ),
    );
  }

  getById(id: string): Observable<Product | undefined> {
    for (const products of this.cache.values()) {
      const found = products.find((p) => p.id === id);
      if (found) {
        return of(found);
      }
    }

    return this.productApiService.getProduct(id);
  }

  clearCache(): void {
    this.cache.clear();
  }
}
