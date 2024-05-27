import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DemoHostComponent } from '../../controls/demo-host.component';
import { DemoPageHeaderComponent } from '../../controls/demo-page-header.component';
import { CustomerDemoComponent } from './customer-demo/customer-demo.component';

@Component({
  selector: 'app-async-signal-page',
  standalone: true,
  imports: [CustomerDemoComponent, DemoHostComponent, DemoPageHeaderComponent],
  template: `
<app-demo-page-header fnName="asyncSignal" />
<p>
  "Flattens" a source of promises or observables to a signal of result values, switching to the new source as soon as it
  changes.
</p>
<p>
  To avoid confusion an observable of observables is not "flattened." This is so observables passed in as the valueSource can
  create a writable signal. The function <code class="inline">toSignal</code> can be used if this behavior is necessary.
</p>
<p>
  This function is most convenient when you need to execute an asynchronous request when a signal changes.
  As seen in the example below, you can mix signals and observables by wrapping them in an anonymous function.
  This function is converted to a computed signal that returns an observable.
  Every time a signal changes, <b>asyncSignal</b> will unsubscribe from the old observable and
  subscribe to the new one, behaving similarly to an Rxjs <code class="inline">switchMap</code>.
</p>
<app-demo-host name="Execute Async Requests When a Signal Changes"
  pattern="async-signal/customer-demo/"
  primaryComponentPattern="component\\.ts"
  hiddenPattern="service\\.ts">
  <app-customer-demo />
</app-demo-host>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AsyncSignalPageComponent {

}
