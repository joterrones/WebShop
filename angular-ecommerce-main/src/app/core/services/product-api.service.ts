import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CategoryOption,
  Product,
  ProductWriteDto,
} from '../../shared/models/product';
import {
  ApiProductResponse,
  ApiProductsListResponse,
} from '../../shared/models/api-product';
import { resolveMediaUrl } from '../../shared/utils/media.util';

export interface UploadedImage {
  url: string;
  publicUrl: string;
  filename: string;
  sortOrder: number;
  isPrimary: boolean;
}

export interface ListProductsParams {
  categorySlug?: string;
  categoryId?: string;
  search?: string;
  showInBanner?: boolean;
  /** undefined = todos (con includeInactive); true/false = filtro */
  isActive?: boolean;
  includeInactive?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ProductApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/products`;
  private readonly categoriesUrl = `${environment.apiUrl}/categories`;

  getProducts(
    categorySlugOrParams?: string | ListProductsParams,
    includeInactive = false,
  ): Observable<Product[]> {
    const paramsObj: ListProductsParams =
      typeof categorySlugOrParams === 'string' ||
      categorySlugOrParams === undefined
        ? {
            categorySlug: categorySlugOrParams,
            includeInactive,
          }
        : categorySlugOrParams;

    let params = new HttpParams().set('limit', '100');
    if (paramsObj.categorySlug) {
      params = params.set('categorySlug', paramsObj.categorySlug);
    }
    if (paramsObj.categoryId) {
      params = params.set('categoryId', paramsObj.categoryId);
    }
    if (paramsObj.search?.trim()) {
      params = params.set('search', paramsObj.search.trim());
    }
    if (paramsObj.showInBanner !== undefined) {
      params = params.set('showInBanner', String(paramsObj.showInBanner));
    }
    if (paramsObj.isActive !== undefined) {
      params = params.set('isActive', String(paramsObj.isActive));
    } else if (paramsObj.includeInactive) {
      params = params.set('includeInactive', 'true');
    }

    return this.http
      .get<ApiProductsListResponse>(this.baseUrl, { params })
      .pipe(map((response) => response.data.map((p) => this.mapToProduct(p))));
  }

  getProduct(id: string): Observable<Product | undefined> {
    return this.http.get<ApiProductResponse>(`${this.baseUrl}/${id}`).pipe(
      map((apiProduct) => this.mapToProduct(apiProduct)),
    );
  }

  getCategories(): Observable<CategoryOption[]> {
    return this.http.get<CategoryOption[]>(this.categoriesUrl);
  }

  createProduct(dto: ProductWriteDto): Observable<Product> {
    return this.http
      .post<ApiProductResponse>(this.baseUrl, dto)
      .pipe(map((p) => this.mapToProduct(p)));
  }

  updateProduct(id: string, dto: Partial<ProductWriteDto>): Observable<Product> {
    return this.http
      .put<ApiProductResponse>(`${this.baseUrl}/${id}`, dto)
      .pipe(map((p) => this.mapToProduct(p)));
  }

  deleteProduct(id: string): Observable<{ message: string; id: string }> {
    return this.http.delete<{ message: string; id: string }>(
      `${this.baseUrl}/${id}`,
    );
  }

  uploadImages(files: File[]): Observable<{ images: UploadedImage[] }> {
    const formData = new FormData();
    for (const file of files) {
      formData.append('images', file);
    }
    return this.http.post<{ images: UploadedImage[] }>(
      `${this.baseUrl}/upload`,
      formData,
    );
  }

  private mapToProduct(apiProduct: ApiProductResponse): Product {
    const images = (apiProduct.images ?? []).map((url) => resolveMediaUrl(url));
    const urlImg = resolveMediaUrl(apiProduct.urlImg) || images[0] || '';

    return {
      id: apiProduct.id,
      name: apiProduct.name,
      description: apiProduct.description,
      urlImg,
      images,
      imagePaths: apiProduct.imagePaths,
      reviews: apiProduct.reviews ?? 0,
      ratingRate: apiProduct.ratingRate ?? 5,
      category: apiProduct.category,
      categoryId: apiProduct.categoryId,
      categoryName: apiProduct.categoryName,
      price: apiProduct.price,
      previousPrice: apiProduct.previousPrice,
      inStock: apiProduct.inStock,
      stockQuantity: apiProduct.stockQuantity,
      isActive: apiProduct.isActive,
      showInBanner: apiProduct.showInBanner ?? false,
      attributes: apiProduct.attributes,
      slug: apiProduct.slug,
    };
  }
}
