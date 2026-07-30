import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateOrderDto, OrderResponse } from '../../shared/models/create-order';
import { OrderService } from './order.service';

/** @deprecated Use OrderService.createOrder instead */
@Injectable({
  providedIn: 'root',
})
export class PurchaseService {
  private readonly orderService = inject(OrderService);

  save(dto: CreateOrderDto): Observable<OrderResponse> {
    return this.orderService.createOrder(dto);
  }
}
