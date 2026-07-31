import { Pipe, PipeTransform } from '@angular/core';

/** Formatea montos en soles peruanos: S/. 12.50 */
@Pipe({
  name: 'solCurrency',
  standalone: true,
})
export class SolCurrencyPipe implements PipeTransform {
  transform(value: number | string | null | undefined): string {
    const amount = Number(value);
    if (value === null || value === undefined || Number.isNaN(amount)) {
      return 'S/. 0.00';
    }
    return `S/. ${amount.toFixed(2)}`;
  }
}
