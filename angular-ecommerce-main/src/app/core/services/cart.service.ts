import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  catchError,
  map,
  of,
  tap,
} from 'rxjs';
import { environment } from '../../../environments/environment';
import { CartProduct } from '../../shared/models/cart-product';
import { Product } from '../../shared/models/product';
import { resolveMediaUrl } from '../../shared/utils/media.util';

const SESSION_KEY = 'cart-session-id';
const LEGACY_KEY = 'cart-products';

export interface ApiCartItem {
  id: string;
  productId: string;
  talla: string;
  quantity: number;
  product: Product & { imagePaths?: string[] };
  lineTotal: number;
}

export interface ApiCart {
  id: string | null;
  sessionToken: string;
  items: ApiCartItem[];
  count: number;
  total: number;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/cart`;

  private readonly itemsSubject = new BehaviorSubject<CartProduct[]>([]);
  private readonly productIdsSubject = new BehaviorSubject<Set<string>>(
    new Set(),
  );
  private loaded = false;

  readonly items$ = this.itemsSubject.asObservable();
  readonly productIds$ = this.productIdsSubject.asObservable();
  readonly count$ = this.items$.pipe(
    map((items) => items.reduce((sum, item) => sum + item.quantity, 0)),
  );
  readonly total$ = this.items$.pipe(
    map((items) =>
      items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    ),
  );

  get items(): CartProduct[] {
    return this.itemsSubject.value;
  }

  get count(): number {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  get total(): number {
    return this.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0,
    );
  }

  loadCart(): Observable<CartProduct[]> {
    return this.http.get<ApiCart>(this.baseUrl, { headers: this.headers() }).pipe(
      map((cart) => this.applyCart(cart)),
      catchError(() => {
        this.applyCart({
          id: null,
          sessionToken: this.getSessionToken(),
          items: [],
          count: 0,
          total: 0,
        });
        return of([] as CartProduct[]);
      }),
      tap(() => {
        this.loaded = true;
      }),
    );
  }

  ensureLoaded(): void {
    if (!this.loaded) {
      this.loadCart().subscribe();
    }
  }

  hasProduct(productId: string): boolean {
    return this.productIdsSubject.value.has(productId);
  }

  hasProductWithTalla(productId: string, talla: string): boolean {
    return this.items.some(
      (item) => item.product.id === productId && item.talla === talla,
    );
  }

  addProduct(
    product: Product,
    quantity = 1,
    talla = 'M',
  ): Observable<CartProduct[]> {
    if (!product?.id || quantity < 1) {
      return of(this.items);
    }

    return this.http
      .post<ApiCart>(
        `${this.baseUrl}/items`,
        {
          productId: product.id,
          quantity,
          talla,
          sessionToken: this.getSessionToken(),
        },
        { headers: this.headers() },
      )
      .pipe(
        map((cart) => this.applyCart(cart)),
        catchError(() => of(this.items)),
      );
  }

  setQuantity(itemId: string, quantity: number): Observable<CartProduct[]> {
    if (quantity < 1) {
      return this.removeItem(itemId);
    }

    return this.http
      .patch<ApiCart>(
        `${this.baseUrl}/items/${itemId}`,
        { quantity, sessionToken: this.getSessionToken() },
        { headers: this.headers() },
      )
      .pipe(map((cart) => this.applyCart(cart)));
  }

  increase(itemId: string, by = 1): Observable<CartProduct[]> {
    const item = this.items.find((i) => i.id === itemId);
    if (!item) return of(this.items);
    return this.setQuantity(itemId, item.quantity + by);
  }

  decrease(itemId: string, by = 1): Observable<CartProduct[]> {
    const item = this.items.find((i) => i.id === itemId);
    if (!item) return of(this.items);
    return this.setQuantity(itemId, Math.max(1, item.quantity - by));
  }

  removeItem(itemId: string): Observable<CartProduct[]> {
    return this.http
      .delete<ApiCart>(`${this.baseUrl}/items/${itemId}`, {
        headers: this.headers(),
      })
      .pipe(map((cart) => this.applyCart(cart)));
  }

  /** @deprecated Prefer removeItem(itemId) */
  removeProduct(productId: string): Observable<CartProduct[]> {
    const item = this.items.find((i) => i.product.id === productId);
    if (!item) return of(this.items);
    return this.removeItem(item.id);
  }

  clear(): Observable<CartProduct[]> {
    return this.http
      .delete<ApiCart>(this.baseUrl, { headers: this.headers() })
      .pipe(
        map((cart) => this.applyCart(cart)),
        catchError(() => {
          this.applyCart({
            id: null,
            sessionToken: this.getSessionToken(),
            items: [],
            count: 0,
            total: 0,
          });
          return of([] as CartProduct[]);
        }),
      );
  }

  private applyCart(cart: ApiCart): CartProduct[] {
    const items: CartProduct[] = (cart.items ?? []).map((item) => ({
      id: item.id,
      talla: item.talla,
      product: {
        ...item.product,
        urlImg: resolveMediaUrl(item.product.urlImg),
        images: (item.product.images ?? []).map((u) => resolveMediaUrl(u)),
      },
      quantity: item.quantity,
    }));

    this.itemsSubject.next(items);
    this.productIdsSubject.next(new Set(items.map((i) => i.product.id)));
    localStorage.removeItem(LEGACY_KEY);
    return items;
  }

  private headers(): HttpHeaders {
    return new HttpHeaders({
      'x-cart-session': this.getSessionToken(),
    });
  }

  private getSessionToken(): string {
    let token = localStorage.getItem(SESSION_KEY);
    if (!token) {
      token =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `cart-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(SESSION_KEY, token);
    }
    return token;
  }
}
