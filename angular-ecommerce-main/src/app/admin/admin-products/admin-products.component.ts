import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ProductApiService } from '../../core/services/product-api.service';
import { ProductService } from '../../core/services/product.service';
import { SettingsService } from '../../core/services/settings.service';
import {
  CategoryOption,
  Product,
  ProductWriteDto,
} from '../../shared/models/product';
import { SolCurrencyPipe } from '../../shared/pipes/sol-currency.pipe';
import { resolveMediaUrl } from '../../shared/utils/media.util';

export type ProductStatusFilter = 'all' | 'active' | 'inactive';

@Component({
  selector: 'app-admin-products',
  imports: [ReactiveFormsModule, FormsModule, SolCurrencyPipe, RouterLink],
  templateUrl: './admin-products.component.html',
})
export class AdminProductsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly productApi = inject(ProductApiService);
  private readonly productService = inject(ProductService);
  private readonly settingsService = inject(SettingsService);

  products: Product[] = [];
  categories: CategoryOption[] = [];
  loading = true;
  saving = false;
  uploading = false;
  savingWhatsapp = false;
  errorMessage = '';
  successMessage = '';
  whatsappMessage = '';
  whatsappError = '';
  showForm = false;
  editingId: string | null = null;

  filterCategoryId = '';
  filterStatus: ProductStatusFilter = 'all';
  filterSearch = '';

  imagePaths: string[] = [];
  imagePreviews: string[] = [];
  pendingFiles: File[] = [];

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    slug: ['', Validators.required],
    categoryId: ['', Validators.required],
    description: ['', Validators.required],
    basePrice: [0, [Validators.required, Validators.min(0.01)]],
    previousPrice: [null as number | null],
    stockQuantity: [0, [Validators.required, Validators.min(0)]],
    isActive: [true],
    showInBanner: [false],
    reviews: [0, [Validators.required, Validators.min(0)]],
    ratingRate: [5, [Validators.required, Validators.min(0), Validators.max(5)]],
  });

  readonly whatsappForm = this.fb.nonNullable.group({
    whatsappNumber: [
      '',
      [Validators.required, Validators.pattern(/^[0-9]{8,20}$/)],
    ],
  });

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
    this.loadWhatsapp();
  }

  loadWhatsapp(): void {
    this.settingsService.getWhatsapp().subscribe({
      next: (setting) => {
        this.whatsappForm.patchValue({
          whatsappNumber: setting.whatsappNumber || '',
        });
      },
    });
  }

  saveWhatsapp(): void {
    if (this.whatsappForm.invalid || this.savingWhatsapp) {
      this.whatsappForm.markAllAsTouched();
      return;
    }

    this.savingWhatsapp = true;
    this.whatsappError = '';
    this.whatsappMessage = '';

    const number = this.whatsappForm.controls.whatsappNumber.value.trim();

    this.settingsService.updateWhatsapp(number).subscribe({
      next: (setting) => {
        this.savingWhatsapp = false;
        this.whatsappForm.patchValue({
          whatsappNumber: setting.whatsappNumber,
        });
        this.whatsappMessage = 'Número de WhatsApp guardado';
      },
      error: (err) => {
        this.savingWhatsapp = false;
        this.whatsappError =
          err?.error?.error ?? 'No se pudo guardar el número de WhatsApp';
      },
    });
  }

  loadProducts(): void {
    this.loading = true;
    this.errorMessage = '';

    const params: {
      categoryId?: string;
      search?: string;
      isActive?: boolean;
      includeInactive?: boolean;
    } = {};

    if (this.filterCategoryId) {
      params.categoryId = this.filterCategoryId;
    }

    if (this.filterSearch.trim()) {
      params.search = this.filterSearch.trim();
    }

    if (this.filterStatus === 'active') {
      params.isActive = true;
    } else if (this.filterStatus === 'inactive') {
      params.isActive = false;
    } else {
      params.includeInactive = true;
    }

    this.productApi.getProducts(params).subscribe({
      next: (products) => {
        this.products = products;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.errorMessage =
          'No se pudieron cargar los productos. ¿El backend está activo?';
      },
    });
  }

  onFiltersChange(): void {
    this.loadProducts();
  }

  clearFilters(): void {
    this.filterCategoryId = '';
    this.filterStatus = 'all';
    this.filterSearch = '';
    this.loadProducts();
  }

  loadCategories(): void {
    this.productApi.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
    });
  }

  openCreate(): void {
    this.editingId = null;
    this.showForm = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.imagePaths = [];
    this.imagePreviews = [];
    this.pendingFiles = [];
    this.form.reset({
      name: '',
      slug: '',
      categoryId: this.categories[0]?.id ?? '',
      description: '',
      basePrice: 0,
      previousPrice: null,
      stockQuantity: 0,
      isActive: true,
      showInBanner: false,
      reviews: 0,
      ratingRate: 5,
    });
  }

  openEdit(product: Product): void {
    this.editingId = product.id;
    this.showForm = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.pendingFiles = [];
    this.imagePaths = [...(product.imagePaths ?? [])];
    this.imagePreviews = (product.images?.length
      ? product.images
      : this.imagePaths.map((p) => resolveMediaUrl(p))
    ) as string[];

    this.form.patchValue({
      name: product.name,
      slug: product.slug ?? '',
      categoryId: product.categoryId ?? '',
      description: product.description,
      basePrice: product.price,
      previousPrice: product.previousPrice,
      stockQuantity: product.stockQuantity ?? 0,
      isActive: product.isActive ?? true,
      showInBanner: product.showInBanner ?? false,
      reviews: product.reviews ?? 0,
      ratingRate: product.ratingRate ?? 5,
    });
  }

  closeForm(): void {
    this.showForm = false;
    this.editingId = null;
  }

  onNameChange(): void {
    if (this.editingId) return;
    const name = this.form.controls.name.value;
    this.form.controls.slug.setValue(this.slugify(name), { emitEvent: false });
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    if (files.length === 0) return;

    this.pendingFiles = [...this.pendingFiles, ...files];
    for (const file of files) {
      this.imagePreviews.push(URL.createObjectURL(file));
    }
    input.value = '';
  }

  removePreview(index: number): void {
    const preview = this.imagePreviews[index];
    if (preview?.startsWith('blob:')) {
      URL.revokeObjectURL(preview);
      const pathCount = this.imagePaths.length;
      if (index >= pathCount) {
        this.pendingFiles.splice(index - pathCount, 1);
      }
    } else {
      this.imagePaths.splice(index, 1);
    }
    this.imagePreviews.splice(index, 1);
  }

  async save(): Promise<void> {
    if (this.form.invalid || this.saving) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      let paths = [...this.imagePaths];

      if (this.pendingFiles.length > 0) {
        this.uploading = true;
        const uploaded = await firstValueFrom(
          this.productApi.uploadImages(this.pendingFiles),
        );
        this.uploading = false;
        paths = [...paths, ...uploaded.images.map((img) => img.url)];
      }

      const raw = this.form.getRawValue();
      const previous =
        raw.previousPrice === null || Number.isNaN(Number(raw.previousPrice))
          ? null
          : Number(raw.previousPrice);

      const dto: ProductWriteDto = {
        categoryId: raw.categoryId,
        name: raw.name.trim(),
        slug: raw.slug.trim(),
        description: raw.description.trim(),
        basePrice: Number(raw.basePrice),
        previousPrice: previous && previous > 0 ? previous : null,
        stockQuantity: Number(raw.stockQuantity),
        isActive: raw.isActive,
        showInBanner: raw.showInBanner,
        reviews: Number(raw.reviews),
        ratingRate: Number(raw.ratingRate),
        images: paths.map((url, index) => ({
          url,
          sortOrder: index,
          isPrimary: index === 0,
          altText: raw.name.trim(),
        })),
      };

      if (this.editingId) {
        await firstValueFrom(
          this.productApi.updateProduct(this.editingId, dto),
        );
        this.successMessage = 'Producto actualizado correctamente';
      } else {
        await firstValueFrom(this.productApi.createProduct(dto));
        this.successMessage = 'Producto creado correctamente';
      }

      this.productService.clearCache();
      this.closeForm();
      this.loadProducts();
    } catch (err: unknown) {
      this.uploading = false;
      const message =
        (err as { error?: { error?: string } })?.error?.error ??
        'No se pudo guardar el producto';
      this.errorMessage = message;
    } finally {
      this.saving = false;
      this.uploading = false;
    }
  }

  deleteProduct(product: Product): void {
    if (
      !confirm(
        `¿Eliminar el producto "${product.name}"? Esta acción no se puede deshacer.`,
      )
    ) {
      return;
    }

    this.productApi.deleteProduct(product.id).subscribe({
      next: () => {
        this.productService.clearCache();
        this.successMessage = 'Producto eliminado';
        this.loadProducts();
      },
      error: () => {
        this.errorMessage = 'No se pudo eliminar el producto';
      },
    });
  }

  private slugify(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
