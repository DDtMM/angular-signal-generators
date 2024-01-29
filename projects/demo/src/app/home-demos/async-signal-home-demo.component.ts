import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ExampleCodeComponent } from '../controls/example-code.component';
import { HomeBoxComponent } from '../controls/home-box.component';
import { ContentsClassDirective } from '../controls/contents-class.directive';

@Component({
  standalone: true,
  imports: [ExampleCodeComponent, HomeBoxComponent],
  hostDirectives: [ContentsClassDirective],
  template: `
<app-home-box fnName="asyncSignal">
  <div>
  "Flattens" a source of promises or observables to a signal of result values, switching to the new source as soon as it changes.
  </div>
  <div class="divider">Example</div>
  <app-example-code><pre>
$id = signal(0);
// call getCustomer every time $id changes.
$customer = asyncSignal(() => this.$id() !== 0 ? this.getCustomer(this.$id()) : undefined);
</pre></app-example-code>
</app-home-box>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AsyncSignalHomeDemoComponent {

}
