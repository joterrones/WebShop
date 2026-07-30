import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-payment-success',
  imports: [RouterLink],
  templateUrl: './payment-success.component.html',
})
export class PaymentSuccessComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);

  orderNumber = '';
  whatsappOpened = false;

  ngOnInit(): void {
    this.orderNumber =
      this.route.snapshot.queryParamMap.get('orderNumber') ?? '';
    this.whatsappOpened =
      this.route.snapshot.queryParamMap.get('whatsapp') === '1';
  }
}
