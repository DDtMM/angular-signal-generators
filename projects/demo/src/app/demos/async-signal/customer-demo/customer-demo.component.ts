import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { asyncSignal } from '@ddtmm/angular-signal-generators';
import { of, startWith } from 'rxjs';
import { ShopService } from './shop.service';

@Component({
    selector: 'app-customer-demo',
    templateUrl: './customer-demo.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomerDemoComponent {
  private readonly shopSvc = inject(ShopService);
  /* Just a regular observable converted to a signal. */
  readonly $customers = toSignal(this.shopSvc.getCustomers().pipe(startWith(undefined)));
  readonly $id = signal(0);
  /** uses $id signal to get customer products */
  readonly $products = asyncSignal(() =>
    this.$id() !== 0 ? this.shopSvc.getCustomerProducts(this.$id()).pipe(startWith(undefined)) : of([]),
    { defaultValue: [] }
  );
}
