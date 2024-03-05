import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DemoHostComponent } from '../../controls/demo-host.component';
import { DocPageContext } from '../../controls/doc-page.component';
import { SignalHeaderComponent } from '../../controls/signal-header.component';
import { CustomerDemoComponent } from './customer-demo/customer-demo.component';

@Component({
  selector: 'app-async-signal-page',
  standalone: true,
  imports: [CustomerDemoComponent, DemoHostComponent, SignalHeaderComponent],
  template: `
<app-signal-header fnName="debounceSignal" />
<p>
  "Flattens" a source of promises or observables to a signal of result values, switching to the new source as soon as it
  changes.
</p>
<p>
  To avoid confusion an observable of observables is not "flattened." This is so observables passed in as the valueSource can
  create a writable signal. The function <code class="inline p-1">toSignal</code> can be used if this behavior is necessary.
</p>
<app-demo-host name="Execute Async Requests When a Signal Changes"
  prefix="async-signal/customer-demo/customer-demo.component"
  [sourceNames]="['.ts', '.html']">
  <app-customer-demo />
</app-demo-host>

  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AsyncSignalPageComponent {
  readonly $context = input<DocPageContext>('ownPage', { alias: 'context' });
  readonly example = `
readonly $id = signal(0);
// assume getProducts is a method that calls an http endpoint and returns a state.
readonly $products = asyncSignal(() => $id() !== 0 ? this.getProducts(this.$id()) : of([]));
`.trim();
}
