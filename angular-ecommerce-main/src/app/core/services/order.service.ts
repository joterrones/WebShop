import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CreateOrderDto,
  OrderResponse,
} from '../../shared/models/create-order';
import {
  Order,
  OrderStatus,
  OrdersListResponse,
  SetOrderDiscountDto,
  UpdateOrderShippingDto,
  UpdateOrderStatusDto,
} from '../../shared/models/order';

export interface ListOrdersParams {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  search?: string;
  documentNumber?: string;
}

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/orders`;

  createOrder(dto: CreateOrderDto): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(this.baseUrl, dto);
  }

  listOrders(params: ListOrdersParams = {}): Observable<OrdersListResponse> {
    let httpParams = new HttpParams();
    if (params.page != null) {
      httpParams = httpParams.set('page', String(params.page));
    }
    if (params.limit != null) {
      httpParams = httpParams.set('limit', String(params.limit));
    }
    if (params.status) {
      httpParams = httpParams.set('status', params.status);
    }
    if (params.search?.trim()) {
      httpParams = httpParams.set('search', params.search.trim());
    }
    if (params.documentNumber?.trim()) {
      httpParams = httpParams.set(
        'documentNumber',
        params.documentNumber.trim(),
      );
    }
    return this.http.get<OrdersListResponse>(this.baseUrl, {
      params: httpParams,
    });
  }

  getOrder(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.baseUrl}/${id}`);
  }

  updateStatus(id: string, dto: UpdateOrderStatusDto): Observable<Order> {
    return this.http.patch<Order>(`${this.baseUrl}/${id}/status`, dto);
  }

  setDiscount(id: string, dto: SetOrderDiscountDto): Observable<Order> {
    return this.http.put<Order>(`${this.baseUrl}/${id}/discount`, dto);
  }

  updateShipping(id: string, dto: UpdateOrderShippingDto): Observable<Order> {
    return this.http.patch<Order>(`${this.baseUrl}/${id}/shipping`, dto);
  }
}
