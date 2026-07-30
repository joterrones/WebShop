import { AsyncPipe, CurrencyPipe } from '@angular/common';
import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { CartService } from '../core/services/cart.service';
import { FavoritesService } from '../core/services/favorites.service';
import { ProductService } from '../core/services/product.service';
import {
  AVAILABLE_TALLAS,
  AvailableTalla,
  CartProduct,
} from '../shared/models/cart-product';
import { Product, ProductAttributes } from '../shared/models/product';

@Component({
  selector: 'app-product',
  imports: [CurrencyPipe, AsyncPipe, RouterLink],
  templateUrl: './product.component.html',
})
export class ProductComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);
  private readonly favoritesService = inject(FavoritesService);

  readonly availableTallas = AVAILABLE_TALLAS;

  id = input<string>('');
  product$!: Observable<Product | undefined>;
  selectedImageUrl = '';
  selectedTalla = signal<AvailableTalla | ''>('');
  quantity = signal(1);
  sizeError = '';
  adding = false;

  private readonly cartItems = toSignal(this.cartService.items$, {
    initialValue: [] as CartProduct[],
  });

  private readonly favoriteIds = toSignal(this.favoritesService.ids$, {
    initialValue: new Set<string>(),
  });

  readonly inCart = computed(() => {
    const id = this.id();
    const talla = this.selectedTalla();
    if (!id || !talla) return false;
    return this.cartItems().some(
      (item) => item.product?.id === id && item.talla === talla,
    );
  });

  readonly isFavorite = computed(() => {
    const id = this.id();
    return !!id && this.favoriteIds().has(id);
  });

  ngOnInit(): void {
    this.cartService.ensureLoaded();
    this.product$ = this.productService.getById(this.id());
  }

  selectImage(url: string): void {
    this.selectedImageUrl = url;
  }

  displayImage(product: Product): string {
    return this.selectedImageUrl || product.urlImg;
  }

  selectTalla(talla: AvailableTalla): void {
    this.selectedTalla.set(talla);
    this.sizeError = '';
  }

  maxQuantity(product: Product): number {
    const stock = product.stockQuantity ?? 0;
    return Math.max(1, stock);
  }

  decreaseQuantity(): void {
    this.quantity.update((q) => Math.max(1, q - 1));
  }

  increaseQuantity(product: Product): void {
    const max = this.maxQuantity(product);
    this.quantity.update((q) => Math.min(max, q + 1));
  }

  onQuantityInput(event: Event, product: Product): void {
    const value = Number((event.target as HTMLInputElement).value);
    const max = this.maxQuantity(product);
    if (!Number.isFinite(value) || value < 1) {
      this.quantity.set(1);
      return;
    }
    this.quantity.set(Math.min(max, Math.floor(value)));
  }

  attributeEntries(attrs: ProductAttributes): [string, string][] {
    return Object.entries(attrs).filter(
      (entry): entry is [string, string] =>
        !!entry[1] && entry[0] !== 'talla',
    );
  }

  formatAttributeLabel(code: string): string {
    const labels: Record<string, string> = {
      talla: 'Talla',
      tipo_tela: 'Tipo de tela',
      color: 'Color',
      marca: 'Marca',
    };
    return labels[code] ?? code;
  }

  addToCart(product: Product): void {
    if (!product.inStock || this.adding) return;

    const talla = this.selectedTalla();
    if (!talla) {
      this.sizeError = 'Selecciona una talla';
      return;
    }

    const qty = Math.min(this.quantity(), this.maxQuantity(product));
    if (qty < 1) return;

    this.adding = true;
    this.sizeError = '';
    this.cartService.addProduct(product, qty, talla).subscribe({
      next: () => {
        this.adding = false;
      },
      error: () => {
        this.adding = false;
        this.sizeError = 'No se pudo agregar al carrito';
      },
    });
  }

  toggleFavorite(product: Product): void {
    this.favoritesService.toggle(product);
  }
}
