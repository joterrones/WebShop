import { PercentPipe } from '@angular/common';
import { Component, input, OnInit } from '@angular/core';
import { Product } from '../../models/product';
import { RouterLink } from '@angular/router';
import { SolCurrencyPipe } from '../../pipes/sol-currency.pipe';

@Component({
  selector: 'app-product-offer',
  imports: [SolCurrencyPipe, PercentPipe, RouterLink],
  templateUrl: './product-offer.component.html',
})
export class ProductOfferComponent implements OnInit {
  product = input.required<Product>();
  // Marca la primera oferta como prioritaria (fetchpriority="high")
  priority = input<boolean>(false);

  discount: number = 0;

  ngOnInit(): void {
    const previousPrice = this.product().previousPrice;
    const currentPrice = this.product().price;

    if (previousPrice) {
      this.discount = (previousPrice - currentPrice) / previousPrice;
    }
  }
}
