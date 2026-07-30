import { Component, inject, OnInit } from '@angular/core';
import { Product } from '../shared/models/product';
import { HomeProductComponent } from './components/home-product/home-product.component';
import { HomeProductLoadingComponent } from './components/home-product-loading/home-product-loading.component';
import { ProductService } from '../core/services/product.service';
import { AsyncPipe } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { Observable, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-home',
  imports: [
    HomeProductComponent,
    HomeProductLoadingComponent,
    AsyncPipe,
    RouterLink,
  ],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly route = inject(ActivatedRoute);

  products$!: Observable<Product[]>;
  heroProducts: Product[] = [];
  activeCategoryLabel = 'Todos los deportes';
  searchQuery = '';

  readonly skeletons = Array.from({ length: 8 });

  readonly tabs: ReadonlyArray<'Nuevos' | 'Destacados' | 'Más vendidos'> = [
    'Nuevos',
    'Destacados',
    'Más vendidos',
  ];
  activeTab: 'Nuevos' | 'Destacados' | 'Más vendidos' = 'Nuevos';

  private readonly categoryLabels: Record<string, string> = {
    futbol: 'Fútbol',
    running: 'Running',
    'gym-fitness': 'Gym & Fitness',
    natacion: 'Natación',
    outdoor: 'Outdoor',
    calzado: 'Calzado',
    'ropa-deportiva': 'Ropa Deportiva',
  };

  ngOnInit(): void {
    this.loadHeroProducts();

    this.products$ = this.route.queryParamMap.pipe(
      tap((params) => {
        const category = params.get('category');
        const search = params.get('q')?.trim() ?? '';
        this.searchQuery = search;

        if (search && category) {
          const catLabel =
            this.categoryLabels[category] ?? this.formatSlug(category);
          this.activeCategoryLabel = `“${search}” en ${catLabel}`;
        } else if (search) {
          this.activeCategoryLabel = `Resultados: “${search}”`;
        } else if (category) {
          this.activeCategoryLabel =
            this.categoryLabels[category] ?? this.formatSlug(category);
        } else {
          this.activeCategoryLabel = 'Todos los deportes';
        }
      }),
      switchMap((params) => {
        const category = params.get('category') ?? undefined;
        const search = params.get('q')?.trim() || undefined;
        return this.productService.getAll({
          categorySlug: category,
          search,
        });
      }),
    );
  }

  private loadHeroProducts(): void {
    this.productService.getAll().subscribe({
      next: (products) => {
        const withImage = products.filter((p) => !!p.urlImg);
        this.heroProducts = this.pickRandom(withImage, 2);
      },
    });
  }

  private pickRandom(products: Product[], count: number): Product[] {
    if (products.length <= count) {
      return [...products];
    }

    const pool = [...products];
    const picked: Product[] = [];
    for (let i = 0; i < count; i++) {
      const index = Math.floor(Math.random() * pool.length);
      picked.push(pool.splice(index, 1)[0]);
    }
    return picked;
  }

  private formatSlug(slug: string): string {
    return slug
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }
}
