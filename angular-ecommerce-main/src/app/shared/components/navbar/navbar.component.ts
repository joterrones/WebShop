import { AsyncPipe } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, map } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { FavoritesService } from '../../../core/services/favorites.service';
import { ProductApiService } from '../../../core/services/product-api.service';
import { SettingsService } from '../../../core/services/settings.service';
import { CategoryOption } from '../../models/product';
import {
  formatWhatsappDisplay,
  whatsappChatUrl,
  whatsappDigits,
} from '../../utils/whatsapp.util';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, AsyncPipe, FormsModule],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent implements OnInit {
  private readonly cartService = inject(CartService);
  private readonly favoritesService = inject(FavoritesService);
  private readonly productApi = inject(ProductApiService);
  private readonly settingsService = inject(SettingsService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  @ViewChild('searchCategoryRoot')
  private searchCategoryRoot?: ElementRef<HTMLElement>;

  @ViewChild('accountMenuRoot')
  private accountMenuRoot?: ElementRef<HTMLElement>;

  mobileOpen = false;
  searchCategoryOpen = false;
  accountMenuOpen = false;
  scrolled = false;
  categories: CategoryOption[] = [];
  searchQuery = '';
  searchCategorySlug = '';
  readonly cartCount$ = this.cartService.count$;
  readonly favoritesCount$ = this.favoritesService.count$;
  readonly isAdmin$ = this.authService.isAdmin$;
  readonly currentUser$ = this.authService.user$;

  readonly advisoryDisplay = toSignal(
    this.settingsService.whatsappNumber$.pipe(
      map((n) => formatWhatsappDisplay(n)),
    ),
    { initialValue: '' },
  );

  readonly advisoryHref = toSignal(
    this.settingsService.whatsappNumber$.pipe(
      map((n) =>
        whatsappChatUrl(n, 'Hola, necesito asesoría deportiva'),
      ),
    ),
    { initialValue: '' },
  );

  readonly hasAdvisory = toSignal(
    this.settingsService.whatsappNumber$.pipe(
      map((n) => whatsappDigits(n).length > 0),
    ),
    { initialValue: false },
  );

  ngOnInit(): void {
    this.scrolled = window.scrollY > 64;
    this.cartService.ensureLoaded();
    this.settingsService.ensureWhatsappLoaded();
    this.authService.restoreSession().subscribe();
    this.syncSearchFromUrl();
    this.productApi.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
    });

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => this.syncSearchFromUrl());
  }

  logout(): void {
    this.authService.logout();
    this.mobileOpen = false;
    void this.router.navigate(['/']);
  }

  onSearch(event: Event): void {
    event.preventDefault();
    this.applySearchFilters();
  }

  selectSearchCategory(slug: string, event?: Event): void {
    event?.preventDefault();
    event?.stopPropagation();
    this.searchCategorySlug = slug;
    this.searchCategoryOpen = false;
    this.applySearchFilters();
  }

  searchCategoryLabel(): string {
    if (!this.searchCategorySlug) return 'Todas las categorías';
    const found = this.categories.find(
      (c) => c.slug === this.searchCategorySlug,
    );
    return found?.name ?? this.searchCategorySlug;
  }

  toggleSearchCategory(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.searchCategoryOpen = !this.searchCategoryOpen;
    if (this.searchCategoryOpen) {
      this.mobileOpen = false;
      this.accountMenuOpen = false;
    }
  }

  toggleMobile(): void {
    this.mobileOpen = !this.mobileOpen;
    if (this.mobileOpen) {
      this.searchCategoryOpen = false;
      this.accountMenuOpen = false;
    }
  }

  toggleAccountMenu(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.accountMenuOpen = !this.accountMenuOpen;
    if (this.accountMenuOpen) {
      this.searchCategoryOpen = false;
      this.mobileOpen = false;
    }
  }

  closeAccountMenu(): void {
    this.accountMenuOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as Node | null;
    if (!target) return;

    if (this.searchCategoryOpen) {
      const root = this.searchCategoryRoot?.nativeElement;
      if (root && !root.contains(target)) {
        this.searchCategoryOpen = false;
      }
    }

    if (this.accountMenuOpen) {
      const root = this.accountMenuRoot?.nativeElement;
      if (root && !root.contains(target)) {
        this.accountMenuOpen = false;
      }
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.searchCategoryOpen = false;
    this.accountMenuOpen = false;
    this.mobileOpen = false;
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    // Histeresis: evita parpadeo cerca del tope al cambiar solo estilos visuales
    const y = window.scrollY;
    if (!this.scrolled && y > 64) {
      this.scrolled = true;
    } else if (this.scrolled && y < 16) {
      this.scrolled = false;
    }
  }

  private applySearchFilters(): void {
    const q = this.searchQuery.trim();
    const queryParams: Record<string, string> = {};
    if (q) queryParams['q'] = q;
    if (this.searchCategorySlug) {
      queryParams['category'] = this.searchCategorySlug;
    }

    this.searchCategoryOpen = false;
    this.mobileOpen = false;

    void this.router.navigate(['/'], {
      queryParams,
      fragment: 'trending',
    });
  }

  private syncSearchFromUrl(): void {
    const tree = this.router.parseUrl(this.router.url);
    this.searchQuery = tree.queryParams['q'] ?? '';
    this.searchCategorySlug = tree.queryParams['category'] ?? '';
  }
}
