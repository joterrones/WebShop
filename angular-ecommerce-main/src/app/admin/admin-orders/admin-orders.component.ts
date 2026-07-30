import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import {
  Order,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_TRANSITIONS,
  OrderStatus,
} from '../../shared/models/order';
import { openOrderQuotation } from '../../shared/utils/quotation.util';

@Component({
  selector: 'app-admin-orders',
  imports: [FormsModule, CurrencyPipe, DatePipe, RouterLink],
  templateUrl: './admin-orders.component.html',
})
export class AdminOrdersComponent implements OnInit {
  private readonly orderService = inject(OrderService);

  readonly statusLabels = ORDER_STATUS_LABELS;
  readonly statusFilters: Array<OrderStatus | 'all'> = [
    'all',
    'pendiente',
    'en_proceso',
    'atendido',
  ];

  orders: Order[] = [];
  loading = true;
  updatingId: string | null = null;
  quotingId: string | null = null;
  errorMessage = '';
  successMessage = '';

  filterStatus: OrderStatus | 'all' = 'all';
  search = '';
  page = 1;
  limit = 20;
  total = 0;
  totalPages = 0;

  selectedId: string | null = null;
  selectedOrder: Order | null = null;
  nextStatus: OrderStatus | '' = '';
  statusReason = '';

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.errorMessage = '';
    this.orderService
      .listOrders({
        page: this.page,
        limit: this.limit,
        status: this.filterStatus === 'all' ? undefined : this.filterStatus,
        search: this.search || undefined,
      })
      .subscribe({
        next: (res) => {
          this.orders = res.data;
          this.total = res.meta.total;
          this.totalPages = res.meta.totalPages;
          this.loading = false;
          if (
            this.selectedId &&
            !this.orders.some((o) => o.id === this.selectedId)
          ) {
            this.clearSelection();
          } else if (this.selectedId) {
            const updated = this.orders.find((o) => o.id === this.selectedId);
            if (updated) {
              this.selectedOrder = updated;
              this.nextStatus = '';
            }
          }
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage =
            err?.error?.message || 'No se pudieron cargar los pedidos.';
        },
      });
  }

  setFilter(status: OrderStatus | 'all'): void {
    this.filterStatus = status;
    this.page = 1;
    this.loadOrders();
  }

  onSearch(): void {
    this.page = 1;
    this.loadOrders();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.page = page;
    this.loadOrders();
  }

  selectOrder(order: Order): void {
    this.selectedId = order.id;
    this.selectedOrder = order;
    this.nextStatus = '';
    this.statusReason = '';
    this.successMessage = '';
    this.errorMessage = '';
  }

  clearSelection(): void {
    this.selectedId = null;
    this.selectedOrder = null;
    this.nextStatus = '';
    this.statusReason = '';
  }

  generateQuotation(order: Order, event?: Event): void {
    event?.stopPropagation();
    this.quotingId = order.id;
    this.errorMessage = '';
    this.successMessage = '';

    this.orderService.getOrder(order.id).subscribe({
      next: (full) => {
        this.quotingId = null;
        try {
          openOrderQuotation(full);
          this.successMessage = `Cotización de ${full.orderNumber} lista para imprimir o guardar PDF.`;
        } catch (err) {
          this.errorMessage =
            err instanceof Error
              ? err.message
              : 'No se pudo generar la cotización.';
        }
      },
      error: (err) => {
        this.quotingId = null;
        this.errorMessage =
          err?.error?.message || 'No se pudo cargar el pedido para cotizar.';
      },
    });
  }

  allowedTransitions(status: OrderStatus): OrderStatus[] {
    return ORDER_STATUS_TRANSITIONS[status] ?? [];
  }

  needsReason(from: OrderStatus, to: OrderStatus): boolean {
    const order: OrderStatus[] = ['pendiente', 'en_proceso', 'atendido'];
    return order.indexOf(to) < order.indexOf(from);
  }

  statusBadgeClass(status: OrderStatus): string {
    switch (status) {
      case 'pendiente':
        return 'bg-amber-100 text-amber-800';
      case 'en_proceso':
        return 'bg-sky-100 text-sky-800';
      case 'atendido':
        return 'bg-emerald-100 text-emerald-800';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }

  filterLabel(status: OrderStatus | 'all'): string {
    return status === 'all' ? 'Todos' : this.statusLabels[status];
  }

  updateStatus(): void {
    if (!this.selectedOrder || !this.nextStatus) return;

    const from = this.selectedOrder.status;
    const to = this.nextStatus;
    if (this.needsReason(from, to) && !this.statusReason.trim()) {
      this.errorMessage =
        'Indica un motivo para retroceder el estado del pedido.';
      return;
    }

    this.updatingId = this.selectedOrder.id;
    this.errorMessage = '';
    this.successMessage = '';

    this.orderService
      .updateStatus(this.selectedOrder.id, {
        toStatus: to,
        reason: this.statusReason.trim() || undefined,
        changedBy: 'admin',
      })
      .subscribe({
        next: (order) => {
          this.updatingId = null;
          this.selectedOrder = order;
          this.nextStatus = '';
          this.statusReason = '';
          this.successMessage = `Pedido ${order.orderNumber} actualizado a "${this.statusLabels[order.status]}".`;
          this.loadOrders();
        },
        error: (err) => {
          this.updatingId = null;
          this.errorMessage =
            err?.error?.message || 'No se pudo actualizar el estado.';
        },
      });
  }
}
