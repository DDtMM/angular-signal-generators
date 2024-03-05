import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { asyncSignal } from 'projects/signal-generators/src/public-api';
import { of, startWith } from 'rxjs';
import { ShopService } from './shop.service';

@Component({
  selector: 'app-customer-demo',
  standalone: true,
  templateUrl: './customer-demo.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomerDemoComponent {
  private readonly shopSvc = inject(ShopService);

  readonly $customers = toSignal(this.shopSvc.getCustomers().pipe(startWith(undefined)));
  readonly $id = signal(0);
  /** uses $id signal to get customer products */
  readonly $products = asyncSignal(() =>
    this.$id() !== 0 ? this.shopSvc.getCustomerProducts(this.$id()).pipe(startWith(undefined)) : of([]),
    { defaultValue: [] }
  );
}
